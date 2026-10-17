import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { catalog } from "@/lib/catalog";
import { seedSources } from "@/lib/catalog-seed";
import { db } from "@/lib/db";
import { importRegister, storeCandidates } from "@/lib/register-import";
import { syncSources } from "@/lib/sources";
import { sourceRegistry } from "@/lib/catalog";
import { closeDatabase, getWorkspace, postWorkspace, resetAccounts, signUp } from "./helpers";

const fixture = readFileSync(new URL("../fixtures/register-v349-test5.csv", import.meta.url), "utf8");
const imported = importRegister(fixture, { registerVersion: "v349-test5", importedAt: "2026-10-17" });
const count = async (sql: string, values: unknown[] = []) => (await db().query(sql, values)).rows[0].n as number;
async function store() {
  const client = await db().connect();
  try { return await storeCandidates(client, imported); } finally { client.release(); }
}
async function cleanup() {
  await db().query("DELETE FROM review_item WHERE program_id LIKE 'moe-%'");
  await db().query("DELETE FROM source_version WHERE source_id IN (SELECT id FROM source_document WHERE university_ids::text LIKE '%moe-%')");
  await db().query("DELETE FROM source_document WHERE university_ids::text LIKE '%moe-%'");
  await db().query("DELETE FROM program WHERE id LIKE 'moe-%'");
}

test.beforeEach(cleanup);
test.after(async () => {
  await cleanup();
  await db().query("TRUNCATE review_item, source_version, source_check_run, source_document CASCADE");
  const client = await db().connect();
  try { await seedSources(client); } finally { client.release(); }
  await closeDatabase();
});

test("importing the 5 universities stores test-only programs and registers their pages", async () => {
  assert.equal(imported.programs.length, 5);
  const first = await store();
  assert.equal(first.inserted.length, 5);
  assert.deepEqual(first.sources, { added: 10, existing: 0 });
  const { rows } = await db().query("SELECT id, data FROM program WHERE id LIKE 'moe-%' ORDER BY id");
  assert.equal(rows.length, 5);
  for (const row of rows) {
    assert.equal(row.data.publication, "test-only");
    assert.equal(row.data.language, "unknown");
    assert.equal(row.data.importSource.automated, true);
  }
  const watched = await db().query("SELECT url, university_ids FROM source_document WHERE university_ids::text LIKE '%moe-%' ORDER BY url");
  assert.equal(watched.rowCount, 10);
  assert.ok(watched.rows.every((row) => row.university_ids.length === 1 && row.url.startsWith("https://")));

  const again = await store();
  assert.deepEqual([again.inserted.length, again.existing, again.sources], [0, 5, { added: 0, existing: 10 }]);
});

test("an existing row is never overwritten by a re-import", async () => {
  const target = imported.programs[0];
  await db().query("INSERT INTO program(id,data) VALUES($1,$2)", [target.id, JSON.stringify({ ...target, reviewNote: "edited by a reviewer" })]);
  const result = await store();
  assert.equal(result.inserted.length, 4);
  assert.equal(result.existing, 1);
  assert.equal((await db().query("SELECT data->>'reviewNote' AS note FROM program WHERE id=$1", [target.id])).rows[0].note, "edited by a reviewer");
});

test("students never see imported programs, even when they ask for one by id", async () => {
  await resetAccounts();
  await store();
  const guest = (await getWorkspace()).body;
  assert.equal(guest.catalogSource, "database");
  assert.deepEqual(guest.programs.map((program: { id: string }) => program.id).sort(), catalog.map((program) => program.id).sort());
  const cookie = await signUp("hidden@example.test");
  assert.deepEqual((await getWorkspace(cookie)).body.programs.length, catalog.length);
  const id = imported.programs[0].id;
  assert.equal((await postWorkspace({ action: "save", programId: id, saved: true }, cookie)).status, 404);
  assert.equal((await postWorkspace({ action: "start", programId: id, targetIntake: "2027" }, cookie)).status, 404);
  assert.equal(await count("SELECT count(*)::int AS n FROM shortlist"), 0);
  assert.equal(await count("SELECT count(*)::int AS n FROM application"), 0);
  assert.equal(await count("SELECT count(*)::int AS n FROM program WHERE id=$1", [id]), 1, "the row exists, it is only hidden");
});

test("the refresh cron watches imported pages and queues a review when one changes", async () => {
  await db().query("TRUNCATE review_item, source_version, source_check_run, source_document CASCADE");
  const client = await db().connect();
  try { await seedSources(client); } finally { client.release(); }
  await store();
  const page = (body: string) => ({ body: Buffer.from(body), contentType: "text/html", httpStatus: 200 });

  const baseline = await syncSources({ fetcher: async () => page("v1") });
  assert.equal(baseline.summary.checked, sourceRegistry.length + 10);
  assert.ok(baseline.results.every((result) => result.status === "baseline"));

  const target = imported.programs[2];
  const changed = await syncSources({ fetcher: async (url) => page(url === target.source ? "v2" : "v1") });
  assert.deepEqual(changed.summary, { status: "completed", checked: sourceRegistry.length + 10, changed: 1, errors: 0 });
  const queued = (await db().query("SELECT program_id, status, before_data FROM review_item")).rows;
  assert.deepEqual(queued.map((item) => [item.program_id, item.status, item.before_data.publication]), [[target.id, "pending", "test-only"]]);
});
