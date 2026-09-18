import { Pool } from "pg";
const globalDb = globalThis as unknown as { studyPool?: Pool };
export function databaseConfigured() { return Boolean(process.env.DATABASE_URL); }
export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_NOT_CONFIGURED");
  return globalDb.studyPool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 4, connectionTimeoutMillis: 10000, idleTimeoutMillis: 20000 });
}
