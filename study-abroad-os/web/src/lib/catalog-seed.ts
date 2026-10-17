import type { ClientBase } from "pg";
import { catalog } from "./catalog";
import { programSchema, type Program } from "./domain";
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
