import type { ClientBase } from "pg";
import { catalog, sourceRegistry } from "./catalog";
import { programSchema, type Program } from "./domain";
import type { SourceRecord } from "./source-registry";

// Registers sources for the refresh cron. Only the identity (url) and the university list are written:
// hash, status and history belong to syncSources, so re-seeding never resets them. University ids are merged, never dropped.
export async function seedSources(client: ClientBase, sources: SourceRecord[] = sourceRegistry) {
  let added = 0;
  for (const source of sources) {
    const result = await client.query(
      `INSERT INTO source_document(id,url,university_ids) VALUES($1,$2,$3)
       ON CONFLICT(url) DO UPDATE SET university_ids=(SELECT array_agg(DISTINCT u ORDER BY u) FROM unnest(source_document.university_ids || EXCLUDED.university_ids) AS u)
       RETURNING (xmax = 0) AS inserted`,
      [source.id, source.url, source.universityIds],
    );
    if (result.rows[0]?.inserted) added++;
  }
  return { added, existing: sources.length - added };
}

// Inserts only catalog programs that are missing. Existing rows may hold reviewed edits, so they are never overwritten.
export async function seedCatalog(client: ClientBase, programs: Program[] = catalog) {
  const valid = programSchema.array().parse(programs);
  const inserted: string[] = [];
  await client.query("BEGIN");
  try {
    for (const program of valid) {
      const result = await client.query("INSERT INTO program(id,data) VALUES($1,$2) ON CONFLICT(id) DO NOTHING", [program.id, JSON.stringify(program)]);
      if (result.rowCount) inserted.push(program.id);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
  return { inserted, skipped: valid.length - inserted.length };
}
