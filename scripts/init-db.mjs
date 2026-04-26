import fs from "node:fs/promises";
import { createClient } from "@libsql/client";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const db = createClient({
  url: "http://libsql:8080",
});

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

console.log("Ejecutando ddl...");
const ddl = await fs.readFile("./db/ddl.sql", "utf8");
await db.executeMultiple(ddl);

console.log("Ejecutando seeds...");
const seeds = await fs.readFile("./db/seeds.sql", "utf8");
await db.executeMultiple(seeds);

await db.execute(`
  insert into __initialized(id) values (1)
`);

console.log("DB inicializada");