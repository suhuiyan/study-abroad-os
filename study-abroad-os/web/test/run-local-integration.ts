import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
// npm run test:integration:local — starts local PostgreSQL, migrates and seeds the *_test database, then runs test/integration.
// npm run test:e2e:account — same preparation, then a production build and the Playwright account suite.
// The tests truncate account tables, so this refuses any database whose name does not end in _test.
const web = fileURLToPath(new URL("..", import.meta.url));
const envFile = fileURLToPath(new URL("../.env.test", import.meta.url));
if (!existsSync(envFile)) throw new Error("Missing web/.env.test (see .env.example; DATABASE_URL must point at a *_test database)");
process.loadEnvFile(envFile);
const database = new URL(process.env.DATABASE_URL ?? "postgres://invalid").pathname.slice(1);
if (!database.endsWith("_test")) throw new Error(`Refusing to run integration tests against "${database}": use a database named *_test`);
const tsx = fileURLToPath(new URL("../node_modules/tsx/dist/cli.mjs", import.meta.url));
function run(label: string, args: string[], program = tsx) {
  console.log(`\n== ${label}`);
  const result = spawnSync(process.execPath, [program, ...args], { cwd: web, env: process.env, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const bin = (path: string) => fileURLToPath(new URL(`../node_modules/${path}`, import.meta.url));
run("local PostgreSQL", ["scripts/local-db.ts", "start"]);
run("migrate", ["scripts/migrate.ts"]);
run("seed", ["scripts/seed.ts"]);
if (process.argv.includes("--e2e")) {
  run("build", ["build", "--webpack"], bin("next/dist/bin/next"));
  run("account E2E", ["test", "-c", "playwright.account.config.ts", ...process.argv.slice(process.argv.indexOf("--e2e") + 1)], bin("@playwright/test/cli.js"));
} else run("integration tests", ["--test", "--test-concurrency=1", "test/integration/*.test.ts"]);
