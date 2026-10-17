import { betterAuth } from "better-auth";
import { db } from "./db";
const list = (value: string | undefined) => value?.split(",").map((item) => item.trim()).filter(Boolean);
// Rate limits are keyed by client IP. Only name a header your host overwrites (e.g. Vercel's x-forwarded-for):
// a header the client can set itself lets an attacker rotate IPs and bypass the sign-in limit.
export function ipAddressOptions(env: Record<string, string | undefined> = process.env) {
  const ipAddressHeaders = list(env.AUTH_IP_HEADERS), trustedProxies = list(env.AUTH_TRUSTED_PROXIES);
  return { ...(ipAddressHeaders?.length ? { ipAddressHeaders } : {}), ...(trustedProxies?.length ? { trustedProxies } : {}) };
}
function buildAuth() {
  if (!process.env.BETTER_AUTH_SECRET) throw new Error("AUTH_NOT_CONFIGURED");
  return betterAuth({
    database: db(),
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: { enabled: true, minPasswordLength: 12, maxPasswordLength: 128 },
    rateLimit: { enabled: true, storage: "database", window: 60, max: 30 },
    user: { deleteUser: { enabled: true } },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
    advanced: { ipAddress: ipAddressOptions() },
  });
}
let instance: ReturnType<typeof buildAuth> | undefined;
export function getAuth() { return instance ??= buildAuth(); }
