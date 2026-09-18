import { readFile } from "node:fs/promises";
import { getMigrations } from "better-auth/db/migration";
import { getAuth } from "../src/lib/auth";
import { db } from "../src/lib/db";
import { catalog, sourceRegistry } from "../src/lib/catalog";
async function main() {
  if (!process.env.DATABASE_URL || !process.env.BETTER_AUTH_SECRET) throw new Error("Set DATABASE_URL and BETTER_AUTH_SECRET before migration");
  const { runMigrations } = await getMigrations(getAuth().options);
  await runMigrations();
  await db().query(await readFile(new URL("../db/schema.sql", import.meta.url), "utf8"));
  for (const p of catalog) await db().query("INSERT INTO program(id,data) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data, updated_at=now() WHERE program.data->>'checkedAt' IS DISTINCT FROM EXCLUDED.data->>'checkedAt'", [p.id, JSON.stringify(p)]);
  for (const source of sourceRegistry) await db().query("INSERT INTO source_document(id,url,university_ids) VALUES($1,$2,$3) ON CONFLICT(id) DO UPDATE SET url=EXCLUDED.url, university_ids=EXCLUDED.university_ids",[source.id,source.url,source.universityIds]);
  console.log("Database migrated and catalog seeded.");
  await db().end();
}
main().catch(() => { console.error("Migration failed. Check database connectivity and environment configuration."); process.exit(1); });
