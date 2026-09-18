import { betterAuth } from "better-auth";
import { db } from "./db";
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
  });
}
let instance: ReturnType<typeof buildAuth> | undefined;
export function getAuth() { return instance ??= buildAuth(); }
