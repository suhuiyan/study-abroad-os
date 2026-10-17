import assert from "node:assert/strict";
import test from "node:test";
import { catalog } from "@/lib/catalog";
import { db } from "@/lib/db";
import { emptyProfile, makeTasks } from "@/lib/domain";
import { authPost, closeDatabase, cookiesFrom, getWorkspace, origin, password, postWorkspace, resetAccounts, signUp } from "./helpers";

const [first, second] = catalog;
test.beforeEach(resetAccounts);
test.after(closeDatabase);

test("writes require a session and a same-origin request", async () => {
  assert.equal((await postWorkspace({ action: "save", programId: first.id, saved: true })).status, 401);
  const cookie = await signUp("origin@example.test");
  assert.equal((await postWorkspace({ action: "save", programId: first.id, saved: true }, cookie, null)).status, 403);
  assert.equal((await postWorkspace({ action: "save", programId: first.id, saved: true }, cookie, "https://evil.example")).status, 403);
  assert.equal((await postWorkspace("{not json", cookie)).status, 400);
  assert.equal((await postWorkspace({ action: "unknown" }, cookie)).status, 400);
  assert.equal((await db().query("SELECT 1 FROM shortlist")).rowCount, 0);
});

test("the public origin is accepted when the server sees an internal host", async () => {
  const cookie = await signUp("proxy@example.test");
  const internal = "http://internal-host:8080";
  assert.equal((await postWorkspace({ action: "save", programId: first.id, saved: true }, cookie, origin, internal)).status, 200);
  assert.equal((await postWorkspace({ action: "save", programId: first.id, saved: true }, cookie, "https://evil.example", internal)).status, 403);
});

test("profile is stored per user and validated", async () => {
  const cookie = await signUp("profile@example.test");
  assert.equal((await postWorkspace({ action: "profile", data: { ...emptyProfile, name: "" } }, cookie)).status, 400);
  const profile = { ...emptyProfile, name: "ปาล์ม", ielts: 6.5, intake: "2027" };
  assert.equal((await postWorkspace({ action: "profile", data: profile }, cookie)).status, 200);
  assert.equal((await getWorkspace(cookie)).body.profile.name, "ปาล์ม");
});

test("shortlist saves, survives a new sign-in, and unsaves", async () => {
  const cookie = await signUp("shortlist@example.test");
  assert.equal((await postWorkspace({ action: "save", programId: first.id, saved: true }, cookie)).status, 200);
  assert.equal((await postWorkspace({ action: "save", programId: first.id, saved: true }, cookie)).status, 200, "saving twice is idempotent");
  assert.equal((await postWorkspace({ action: "save", programId: second.id, saved: true }, cookie)).status, 200);
  assert.equal((await postWorkspace({ action: "save", programId: "no-such-program", saved: true }, cookie)).status, 404);
  const otherDevice = cookiesFrom(await authPost("sign-in/email", { email: "shortlist@example.test", password }));
  assert.deepEqual(new Set((await getWorkspace(otherDevice)).body.saved), new Set([first.id, second.id]));
  assert.equal((await postWorkspace({ action: "save", programId: first.id, saved: false }, otherDevice)).status, 200);
  assert.deepEqual((await getWorkspace(cookie)).body.saved, [second.id]);
});

test("starting a plan creates program tasks once and validates the intake", async () => {
  const cookie = await signUp("plan@example.test");
  assert.equal((await postWorkspace({ action: "start", programId: first.id, targetIntake: "next year" }, cookie)).status, 400);
  assert.equal((await postWorkspace({ action: "start", programId: first.id }, cookie)).status, 400, "no target and no profile intake");
  assert.equal((await postWorkspace({ action: "start", programId: "no-such-program", targetIntake: "2027" }, cookie)).status, 404);
  const started = await postWorkspace({ action: "start", programId: first.id, targetIntake: "2027" }, cookie);
  assert.equal(started.status, 200);
  assert.equal(started.body.application.version, 1);
  assert.equal(started.body.application.status, "preparing");
  assert.deepEqual(started.body.application.tasks, makeTasks(first));
  const again = await postWorkspace({ action: "start", programId: first.id, targetIntake: "2028" }, cookie);
  assert.equal(again.body.application.id, started.body.application.id);
  assert.equal(again.body.application.targetIntake, "2027", "restarting never resets an existing plan");
  await postWorkspace({ action: "profile", data: { ...emptyProfile, name: "ปาล์ม", intake: "2027-09" } }, cookie);
  const fromProfile = await postWorkspace({ action: "start", programId: second.id }, cookie);
  assert.equal(fromProfile.body.application.targetIntake, "2027-09", "falls back to the profile intake");
  assert.equal((await getWorkspace(cookie)).body.applications.length, 2);
});

test("plan updates use optimistic versions", async () => {
  const cookie = await signUp("version@example.test");
  const app = (await postWorkspace({ action: "start", programId: first.id, targetIntake: "2027" }, cookie)).body.application;
  const tasks = app.tasks.map((task: { done: boolean }, index: number) => ({ ...task, done: index === 0 }));
  const updated = await postWorkspace({ action: "application", data: { id: app.id, programId: app.programId, expectedVersion: 1, patch: { tasks, notes: "เริ่มเตรียมเอกสาร" } } }, cookie);
  assert.equal(updated.status, 200);
  assert.equal(updated.body.application.version, 2);
  const stale = await postWorkspace({ action: "application", data: { id: app.id, programId: app.programId, expectedVersion: 1, patch: { notes: "แท็บเก่า" } } }, cookie);
  assert.equal(stale.status, 409);
  assert.equal(stale.body.code, "APPLICATION_CONFLICT");
  const empty = await postWorkspace({ action: "application", data: { id: app.id, programId: app.programId, expectedVersion: 2, patch: {} } }, cookie);
  assert.equal(empty.status, 400);
  const [stored] = (await getWorkspace(cookie)).body.applications;
  assert.equal(stored.version, 2);
  assert.equal(stored.notes, "เริ่มเตรียมเอกสาร");
  assert.equal(stored.tasks[0].done, true);
});

test("one student cannot read or change another student's data", async () => {
  const alice = await signUp("alice@example.test", "Alice");
  const bob = await signUp("bob@example.test", "Bob");
  await postWorkspace({ action: "save", programId: first.id, saved: true }, alice);
  const app = (await postWorkspace({ action: "start", programId: first.id, targetIntake: "2027" }, alice)).body.application;
  const bobView = (await getWorkspace(bob)).body;
  assert.deepEqual(bobView.saved, []);
  assert.deepEqual(bobView.applications, []);
  const hijack = await postWorkspace({ action: "application", data: { id: app.id, programId: app.programId, expectedVersion: 1, patch: { notes: "hijacked" } } }, bob);
  assert.equal(hijack.status, 404);
  assert.equal((await getWorkspace(alice)).body.applications[0].notes, "");
});

test("program edits are refused for students and deferred to the review queue for admins", async () => {
  const cookie = await signUp("admin@example.test");
  assert.equal((await postWorkspace({ action: "program", data: {} }, cookie)).status, 403);
  await db().query(`INSERT INTO admin_user(user_id) SELECT id FROM "user" WHERE email=$1`, ["admin@example.test"]);
  assert.equal((await getWorkspace(cookie)).body.admin, true);
  assert.equal((await postWorkspace({ action: "program", data: {} }, cookie)).status, 409);
});

test("successful writes are recorded as activity events", async () => {
  const cookie = await signUp("activity@example.test");
  await postWorkspace({ action: "save", programId: first.id, saved: true }, cookie);
  await postWorkspace({ action: "start", programId: first.id, targetIntake: "2027" }, cookie);
  await postWorkspace({ action: "save", programId: "no-such-program", saved: true }, cookie);
  const { rows } = await db().query("SELECT event FROM activity_event ORDER BY id");
  assert.deepEqual(rows.map((row) => row.event), ["save", "start"], "failed writes roll back without an event");
});
