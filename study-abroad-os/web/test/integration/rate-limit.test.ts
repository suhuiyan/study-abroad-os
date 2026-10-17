import assert from "node:assert/strict";
import test from "node:test";
import { ipAddressOptions } from "@/lib/auth";
import { authPost, closeDatabase, resetAccounts } from "./helpers";

test.beforeEach(resetAccounts);
test.after(closeDatabase);
const wrongSignIn = (ip: string) => authPost("sign-in/email", { email: "nobody@example.test", password: "wrong-password-123" }, "", { "x-forwarded-for": ip });

test("sign-in is limited to 3 attempts per 10 seconds for one client IP", async () => {
  for (let attempt = 1; attempt <= 3; attempt++) assert.equal((await wrongSignIn("198.51.100.7")).status, 401, `attempt ${attempt}`);
  assert.equal((await wrongSignIn("198.51.100.7")).status, 429);
});

test("each client IP has its own sign-in bucket", async () => {
  for (let attempt = 1; attempt <= 4; attempt++) await wrongSignIn("198.51.100.7");
  assert.equal((await wrongSignIn("198.51.100.8")).status, 401, "another student is not locked out");
});

test("IP header settings come from the environment and default to Better Auth's", () => {
  assert.deepEqual(ipAddressOptions({}), {});
  assert.deepEqual(ipAddressOptions({ AUTH_IP_HEADERS: " x-real-ip , ,x-forwarded-for", AUTH_TRUSTED_PROXIES: "10.0.0.0/8" }), { ipAddressHeaders: ["x-real-ip", "x-forwarded-for"], trustedProxies: ["10.0.0.0/8"] });
});
