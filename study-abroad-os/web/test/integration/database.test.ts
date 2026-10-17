import assert from "node:assert/strict";
import test from "node:test";
import { catalog } from "@/lib/catalog";
import { seedCatalog } from "@/lib/catalog-seed";
import { db } from "@/lib/db";
import { programSchema } from "@/lib/domain";
import { closeDatabase, getWorkspace } from "./helpers";

test.after(closeDatabase);

test("migration creates the app and Better Auth tables", async () => {
  const { rows } = await db().query<{ table_name: string }>("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
  const tables = new Set(rows.map((row) => row.table_name));
  for (const name of ["user", "session", "account", "verification", "rateLimit", "student_profile", "program", "shortlist", "application", "admin_user", "program_revision", "activity_event", "source_document", "source_version", "source_check_run", "review_item"])
    assert.ok(tables.has(name), `missing table ${name}`);
});

test("seed stores the bundled catalog and parses back through the domain schema", async () => {
  const { rows } = await db().query<{ id: string; data: unknown }>("SELECT id, data FROM program ORDER BY id");
  assert.deepEqual(rows.map((row) => row.id), catalog.map((program) => program.id).sort());
  for (const row of rows) assert.deepEqual(programSchema.parse(row.data), catalog.find((program) => program.id === row.id));
});

test("re-seeding inserts nothing and never overwrites an edited row", async () => {
  const client = await db().connect();
  try {
    const original = (await client.query("SELECT data FROM program WHERE id=$1", [catalog[0].id])).rows[0].data;
    await client.query("UPDATE program SET data = jsonb_set(data, '{reviewNote}', '\"edited by reviewer\"') WHERE id=$1", [catalog[0].id]);
    try {
      const result = await seedCatalog(client);
      assert.deepEqual(result, { inserted: [], skipped: catalog.length });
      const after = (await client.query("SELECT data->>'reviewNote' AS note FROM program WHERE id=$1", [catalog[0].id])).rows[0].note;
      assert.equal(after, "edited by reviewer");
    } finally {
      await client.query("UPDATE program SET data=$2 WHERE id=$1", [catalog[0].id, JSON.stringify(original)]);
    }
  } finally { client.release(); }
});

test("guest workspace reads the catalog from the database", async () => {
  const { status, body } = await getWorkspace();
  assert.equal(status, 200);
  assert.equal(body.configured, true);
  assert.equal(body.catalogSource, "database");
  assert.equal(body.user, null);
  assert.equal(body.programs.length, catalog.length);
});
