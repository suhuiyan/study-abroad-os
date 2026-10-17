import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { db } from "../src/lib/db";
import { importRegister, storeCandidates } from "../src/lib/register-import";
// npm run db:import -- <register.csv> [--version v349-test5] [--dry-run]
// Imports register rows as test-only programs (never shown to students) and registers their pages for the refresh cron.
async function main() {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith("--"));
  if (!file) throw new Error("Usage: db:import -- <register.csv> [--version <label>] [--dry-run]");
  const versionIndex = args.indexOf("--version");
  const registerVersion = versionIndex >= 0 ? args[versionIndex + 1] : basename(file, ".csv");
  const result = importRegister(await readFile(file, "utf8"), { registerVersion, importedAt: new Date().toISOString().slice(0, 10) });
  console.log(`Read ${result.programs.length + result.rejected.length} rows: ${result.programs.length} accepted, ${result.rejected.length} rejected.`);
  for (const item of result.rejected) console.log(`  rejected ${item.moe || "(no MOE)"}: ${item.reason}`);
  if (args.includes("--dry-run")) return console.log(`Dry run: ${result.sources.length} sources would be registered; nothing written.`);
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL (or use --dry-run)");
  const client = await db().connect();
  try {
    const stored = await storeCandidates(client, result);
    console.log(`Stored as test-only: ${stored.inserted.length} inserted, ${stored.existing} already present (left unchanged).`);
    console.log(`Sources registered for the refresh cron: ${stored.sources.added} added, ${stored.sources.existing} already registered.`);
  } finally { client.release(); await db().end(); }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Import failed."); process.exit(1); });
