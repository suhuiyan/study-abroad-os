import assert from "node:assert/strict";
import test from "node:test";
import { db } from "@/lib/db";
import { authPost, closeDatabase, cookiesFrom, getWorkspace, password, resetAccounts, signUp } from "./helpers";

test.beforeEach(resetAccounts);
test.after(closeDatabase);

test("sign-up creates a user, hashes the password and opens a session", async () => {
  const cookie = await signUp("signup@example.test");
  const { rows } = await db().query(`SELECT a.password FROM "user" u JOIN account a ON a."userId"=u.id WHERE u.email=$1 AND a."providerId"='credential'`, ["signup@example.test"]);
  assert.equal(rows.length, 1);
  assert.notEqual(rows[0].password, password);
  assert.ok(!rows[0].password.includes(password), "stored password must be a hash");
  const { body } = await getWorkspace(cookie);
  assert.deepEqual(body.user, { name: "นักเรียนทดสอบ", email: "signup@example.test" });
  assert.equal(body.admin, false);
});

test("sign-up rejects duplicates and passwords under 12 characters", async () => {
  await signUp("dup@example.test");
  const duplicate = await authPost("sign-up/email", { email: "dup@example.test", password, name: "ซ้ำ" });
  assert.ok(!duplicate.ok, `duplicate sign-up returned ${duplicate.status}`);
  const short = await authPost("sign-up/email", { email: "short@example.test", password: "short-pw", name: "สั้น" });
  assert.equal(short.status, 400);
  assert.equal((await db().query(`SELECT 1 FROM "user" WHERE email=$1`, ["short@example.test"])).rowCount, 0);
});

test("sign-in accepts the right password only", async () => {
  await signUp("signin@example.test");
  const wrong = await authPost("sign-in/email", { email: "signin@example.test", password: "wrong-password-123" });
  assert.equal(wrong.status, 401);
  assert.equal(cookiesFrom(wrong), "");
  const right = await authPost("sign-in/email", { email: "signin@example.test", password });
  assert.equal(right.status, 200);
  const { body } = await getWorkspace(cookiesFrom(right));
  assert.equal(body.user.email, "signin@example.test");
});

test("sign-out ends the session", async () => {
  const cookie = await signUp("signout@example.test");
  const response = await authPost("sign-out", {}, cookie);
  assert.equal(response.status, 200);
  assert.equal((await getWorkspace(cookie)).body.user, null, "old session cookie must stop working");
  assert.equal((await db().query("SELECT 1 FROM session")).rowCount, 0);
});

test("a forged session cookie is treated as a guest", async () => {
  const { status, body } = await getWorkspace("better-auth.session_token=forged.value");
  assert.equal(status, 200);
  assert.equal(body.user, null);
});
