import fs from "node:fs/promises";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;

if (!url) {
  throw new Error("TURSO_DATABASE_URL is required");
}

const db = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const authSchema = await fs.readFile("./db/auth.sql", "utf8");
await db.executeMultiple(authSchema);

console.log("Better Auth tables are ready");
