import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import * as cron from "@/app/api/cron/sources/route";
import { sourceRegistry } from "@/lib/catalog";
import { seedSources } from "@/lib/catalog-seed";
import { db } from "@/lib/db";
import { SourceFetchError } from "@/lib/source-fetch";
import { loadRegisteredSources, syncSources } from "@/lib/sources";
import { closeDatabase } from "./helpers";

const pku = sourceRegistry.find((source) => source.universityIds.includes("pku"))!;
const sha = (body: string) => createHash("sha256").update(body).digest("hex");
const page = (body: string) => async () => ({ body: Buffer.from(body), contentType: "text/html", httpStatus: 200 });
const count = async (table: string) => (await db().query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n as number;
async function reset() {
  await db().query("TRUNCATE review_item, source_version, source_check_run, source_document CASCADE");
}
async function register(sources = sourceRegistry) {
  const client = await db().connect();
  try { return await seedSources(client, sources); } finally { client.release(); }
}

test.beforeEach(reset);
test.after(async () => {
  await reset();
  await register(); // later test files expect the bundled sources to be registered
  await closeDatabase();
});

test("seeding registers each bundled source once, merges universities and never resets sync state", async () => {
  assert.deepEqual(await register(), { added: sourceRegistry.length, existing: 0 });
  assert.deepEqual(await register(), { added: 0, existing: sourceRegistry.length });
  assert.equal(await count("source_document"), sourceRegistry.length);
  await db().query("UPDATE source_document SET latest_hash='abc', status='same' WHERE id=$1", [pku.id]);
  await register([{ ...pku, universityIds: ["extra-university"] }]);
  const { rows } = await db().query("SELECT latest_hash, status, university_ids FROM source_document WHERE id=$1", [pku.id]);
  assert.equal(rows[0].latest_hash, "abc");
  assert.equal(rows[0].status, "same");
  assert.deepEqual(rows[0].university_ids, [...new Set([...pku.universityIds, "extra-university"])].sort());
});

test("the default run checks whatever is registered, and an empty registry is an empty run rather than an error", async () => {
  const empty = await syncSources({ fetcher: page("never fetched") });
  assert.deepEqual(empty.summary, { status: "completed", checked: 0, changed: 0, errors: 0 });
  await register([pku]);
  const run = await syncSources({ fetcher: page("v1") });
  assert.deepEqual(run.results.map((result) => result.status), ["baseline"]);
});

test("a source that was never registered fails the run instead of being silently skipped", async () => {
  await assert.rejects(syncSources({ sources: [pku], fetcher: page("v1") }), /SOURCE_NOT_SEEDED/);
  assert.equal((await db().query("SELECT status, error FROM source_check_run")).rows[0].status, "failed");
});

test("first fetch is a baseline, unchanged pages stay quiet, a changed page queues reviews once per version", async () => {
  await register([pku]);
  const programs = (await db().query("SELECT id, data FROM program WHERE data->>'universityId'=ANY($1)", [pku.universityIds])).rows;
  assert.ok(programs.length >= 1, "seeded catalog must contain a program for this university");

  const baseline = await syncSources({ sources: [pku], fetcher: page("v1") });
  assert.equal(baseline.results[0].status, "baseline");
  assert.equal(await count("source_version"), 1);
  assert.equal(await count("review_item"), 0, "the first fetch is a baseline, not a change");
  assert.equal((await db().query("SELECT status FROM source_check_run")).rows[0].status, "completed");

  assert.equal((await syncSources({ sources: [pku], fetcher: page("v1") })).results[0].status, "same");
  assert.equal(await count("source_version"), 1);

  const changed = await syncSources({ sources: [pku], fetcher: page("v2") });
  assert.deepEqual(changed.summary, { status: "completed", checked: 1, changed: 1, errors: 0 });
  assert.equal(await count("source_version"), 2);
  const queued = (await db().query("SELECT program_id, status, source_hash, before_data, after_data FROM review_item ORDER BY program_id")).rows;
  assert.deepEqual(queued.map((item) => item.program_id), programs.map((program) => program.id).sort());
  for (const item of queued) {
    assert.equal(item.status, "pending");
    assert.equal(item.source_hash, sha("v2"));
    assert.deepEqual(item.before_data, programs.find((program) => program.id === item.program_id)!.data);
    assert.equal(item.after_data, null, "nothing proposes new values yet; a person must read the page");
  }
  assert.notEqual((await db().query("SELECT last_changed_at FROM source_document WHERE id=$1", [pku.id])).rows[0].last_changed_at, null);

  await syncSources({ sources: [pku], fetcher: page("v2") });
  assert.equal(await count("review_item"), queued.length, "re-checking the same version adds nothing");
  await syncSources({ sources: [pku], fetcher: page("v3") });
  assert.equal(await count("review_item"), queued.length * 2, "a new version queues a new review");
});

test("fetch failures are recorded per source and do not stop the run", async () => {
  const [first, second] = sourceRegistry.filter((source) => source.id !== pku.id).slice(0, 2);
  await register([first, second]);
  const fetcher = async (url: string) => {
    if (url === first.url) throw new SourceFetchError("HTTP_ERROR", 404, "text/html");
    return page("ok")();
  };
  const run = await syncSources({ sources: [first, second], fetcher });
  assert.deepEqual(run.summary, { status: "completed", checked: 2, changed: 0, errors: 1 });
  const failed = (await db().query("SELECT status, error, last_http_status FROM source_document WHERE id=$1", [first.id])).rows[0];
  assert.deepEqual(failed, { status: "error", error: "HTTP_ERROR", last_http_status: 404 });
  assert.equal((await db().query("SELECT status FROM source_document WHERE id=$1", [second.id])).rows[0].status, "baseline");
  const run2 = await syncSources({ sources: [first], fetcher: async () => { throw new Error("socket hang up"); } });
  assert.equal(run2.summary.errors, 1);
  assert.equal((await db().query("SELECT error FROM source_document WHERE id=$1", [first.id])).rows[0].error, "NETWORK_ERROR");
  const counts = (await db().query("SELECT checked_count, error_count FROM source_check_run ORDER BY id DESC LIMIT 1")).rows[0];
  assert.deepEqual(counts, { checked_count: 1, error_count: 1 });
});

test("a run that runs out of time defers the rest, and the next run starts with what it skipped", async () => {
  await register();
  const clock = () => {
    let time = 0;
    return { now: () => time, fetcher: async () => { time += 1000; return page("v1")(); } };
  };
  const first = clock();
  const run1 = await syncSources({ fetcher: first.fetcher, now: first.now, timeBudgetMs: 2500 });
  assert.equal(run1.results.length, 3);
  assert.equal(run1.deferred.length, sourceRegistry.length - 3);
  const second = clock();
  const run2 = await syncSources({ fetcher: second.fetcher, now: second.now, timeBudgetMs: 2500 });
  const done = new Set(run1.results.map((result) => result.id));
  assert.ok(run2.results.every((result) => !done.has(result.id)), "sources checked last run must wait behind the unchecked ones");
  const order = (await loadRegisteredSources(db())).map((source) => source.id);
  const checked = new Set([...done, ...run2.results.map((result) => result.id)]);
  assert.deepEqual(order.slice(0, sourceRegistry.length - checked.size).some((id) => checked.has(id)), false, "unchecked sources sort first");
});

test("a second run backs off while another one holds the lock", async () => {
  await register([pku]);
  const holder = await db().connect();
  let fetched = false;
  try {
    await holder.query("SELECT pg_advisory_lock(734921)");
    const run = await syncSources({ sources: [pku], fetcher: async () => { fetched = true; return page("v1")(); } });
    assert.equal(run.summary.status, "already-running");
    assert.deepEqual(run.deferred, [pku.id]);
    assert.equal(fetched, false);
  } finally {
    await holder.query("SELECT pg_advisory_unlock(734921)");
    holder.release();
  }
  assert.equal((await syncSources({ sources: [pku], fetcher: page("v1") })).summary.status, "completed");
});

test("the cron endpoint refuses callers without the secret", async () => {
  const saved = process.env.CRON_SECRET;
  const call = (authorization?: string) => cron.GET(new Request("http://localhost/api/cron/sources", { headers: authorization ? { authorization } : {} }));
  try {
    delete process.env.CRON_SECRET;
    assert.equal((await call("Bearer anything")).status, 503, "not configured");
    process.env.CRON_SECRET = "correct-secret";
    assert.equal((await call()).status, 401);
    assert.equal((await call("Bearer wrong-secret")).status, 401);
    assert.equal((await call("correct-secret")).status, 401, "the Bearer prefix is required");
  } finally {
    if (saved === undefined) delete process.env.CRON_SECRET; else process.env.CRON_SECRET = saved;
  }
  assert.equal(await count("source_check_run"), 0, "rejected calls must not start a run");
});
