import { db } from "@/lib/db";
import * as authRoute from "@/app/api/auth/[...all]/route";
import * as workspaceRoute from "@/app/api/workspace/route";
// Calls the real Next route handlers in-process against the *_test PostgreSQL database (no browser, no dev server).
export const origin = new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000").origin;
export const password = "integration-pass-123";
export async function resetAccounts() {
  await db().query(`TRUNCATE "user", "session", "account", "verification", "rateLimit", activity_event, shortlist, application, student_profile, admin_user CASCADE`);
}
export function cookiesFrom(response: Response, previous = "") {
  const jar = new Map(previous.split("; ").filter(Boolean).map((pair) => pair.split("=", 2) as [string, string]));
  for (const header of response.headers.getSetCookie()) {
    const [pair] = header.split(";");
    const [name, value] = [pair.slice(0, pair.indexOf("=")), pair.slice(pair.indexOf("=") + 1)];
    if (value) jar.set(name, value); else jar.delete(name);
  }
  return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
}
export function authPost(path: string, body: unknown, cookie = "", headers: Record<string, string> = {}) {
  return authRoute.POST(new Request(`${origin}/api/auth/${path}`, { method: "POST", headers: { "content-type": "application/json", origin, ...(cookie ? { cookie } : {}), ...headers }, body: JSON.stringify(body) }));
}
export async function signUp(email: string, name = "นักเรียนทดสอบ") {
  const response = await authPost("sign-up/email", { email, password, name });
  if (!response.ok) throw new Error(`sign-up failed: ${response.status} ${await response.text()}`);
  return cookiesFrom(response);
}
export async function getWorkspace(cookie = "") {
  const response = await workspaceRoute.GET(new Request(`${origin}/api/workspace`, { headers: cookie ? { cookie } : {} }));
  return { status: response.status, body: await response.json() };
}
export async function postWorkspace(body: unknown, cookie = "", requestOrigin: string | null = origin, serverOrigin = origin) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (cookie) headers.cookie = cookie;
  if (requestOrigin) headers.origin = requestOrigin;
  const response = await workspaceRoute.POST(new Request(`${serverOrigin}/api/workspace`, { method: "POST", headers, body: typeof body === "string" ? body : JSON.stringify(body) }));
  return { status: response.status, body: await response.json() };
}
export function closeDatabase() {
  return db().end();
}
