import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
// Account flows against the real *_test PostgreSQL database. Run via `npm run test:e2e:account`,
// which starts local PostgreSQL, migrates, seeds and builds first. The public suite (npm run verify) stays database-free.
process.loadEnvFile(".env.test");
const database = new URL(process.env.DATABASE_URL ?? "postgres://invalid").pathname.slice(1);
if (!database.endsWith("_test")) throw new Error(`Refusing to run account E2E against "${database}": use a database named *_test`);
const baseURL = "http://127.0.0.1:3108";

export default defineConfig({
  ...base,
  testDir: "./test/e2e-account",
  outputDir: "./test-results/account",
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report/account" }]],
  use: { ...base.use, baseURL },
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3108",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL!,
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
      BETTER_AUTH_URL: baseURL,
    },
  },
});
