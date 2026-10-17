import { readFile } from "node:fs/promises";
import { getMigrations } from "better-auth/db/migration";
import { getAuth } from "../src/lib/auth";
import { db } from "../src/lib/db";
async function main() {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) throw new Error("Set DATABASE_URL and BETTER_AUTH_SECRET before migration");
  const { runMigrations } = await getMigrations(getAuth().options);
  await runMigrations();
  await db().query(await readFile(new URL("../db/schema.sql", import.meta.url), "utf8"));
  console.log("Database migrated. Run db:seed only for missing catalog records.");
  await db().end();
}
main().catch(() => { console.error("Migration failed. Check database connectivity and environment configuration."); process.exit(1); });
