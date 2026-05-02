import fs from "node:fs/promises";
import { createClient } from "@libsql/client";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const db = createClient({
  url: "http://libsql:8080",
});

function splitStatements(sql) {
  const statements = [];
  let current = "";
  let depth = 0; // tracks BEGIN...END nesting

  // Remove single-line comments first
  const cleaned = sql.replace(/--[^\n]*/g, "");

  const tokens = cleaned.split(/\b(BEGIN|END|;)\b/i);

  for (const token of tokens) {
    const upper = token.trim().toUpperCase();

    if (upper === "BEGIN") {
      depth++;
      current += token;
    } else if (upper === "END") {
      depth--;
      current += token;
    } else if (upper === ";" && depth === 0) {
      const stmt = current.trim();
      if (stmt.length > 0) {
        statements.push(stmt + ";");
      }
      current = "";
    } else {
      current += token;
    }
  }

  // Catch any trailing statement without a final semicolon
  const remaining = current.trim();
  if (remaining.length > 0) {
    statements.push(remaining + ";");
  }

  return statements;
}

async function executeFile(filePath, label) {
  console.log(`Ejecutando ${label}...`);
  const content = await fs.readFile(filePath, "utf8");
  try {
    await db.executeMultiple(content);
  } catch (err) {
    console.error(`Error en ${label}: ${err.message}`);
    throw err;
  }
  console.log(`✓ ${label} completado`);
}
console.log("Esperando libsql...");

for (let i = 0; i < 30; i++) {
  try {
    await db.execute("select 1");
    console.log("libsql listo");
    break;
  } catch {
    await sleep(1000);
  }

  if (i === 29) {
    throw new Error("libsql no respondió");
  }
}

try {
  await db.execute("select 1 from __initialized limit 1");
  console.log("DB ya inicializada");
  process.exit(0);
} catch {}

await executeFile("./db/ddl.sql", "ddl");
await executeFile("./db/auth.sql", "auth schema");
await executeFile("./db/seeds.sql", "seeds");

await db.execute(`insert into __initialized(id) values (1)`);

console.log("DB inicializada");