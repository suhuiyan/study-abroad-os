import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { Client } from "pg";
// Local development PostgreSQL: npm run db:local -- start|stop|status
// Binaries come from @embedded-postgres but are copied to an ASCII path, because the PostgreSQL
// Windows binaries cannot run from a folder with non-ASCII characters (this repo sits under ドキュメント).
// Data lives outside OneDrive so sync never touches live database files.
const VERSION = "17.10", DATABASES = ["studyabroad_dev", "studyabroad_test"];
const home = process.env.LOCAL_PG_HOME ?? join(process.env.LOCALAPPDATA ?? process.env.HOME ?? ".", "study-abroad-os");
const binDir = join(home, `pg-${VERSION}`, "bin"), dataDir = join(home, "pgdata"), logFile = join(home, "postgres.log");
const exe = (name: string) => join(binDir, process.platform === "win32" ? `${name}.exe` : name);
async function installBinaries() {
  if (existsSync(exe("pg_ctl"))) return;
  const pkg = process.platform === "win32" ? "@embedded-postgres/windows-x64" : `@embedded-postgres/${process.platform}-${process.arch}`;
  const { pg_ctl } = await import(pkg) as { pg_ctl: string };
  cpSync(dirname(dirname(pg_ctl)), dirname(binDir), { recursive: true });
}
function initialise(password: string) {
  if (existsSync(join(dataDir, "PG_VERSION"))) return;
  const tmp = mkdtempSync(join(tmpdir(), "pg-init-"));
  try {
    writeFileSync(join(tmp, "pw"), password);
    execFileSync(exe("initdb"), ["-D", dataDir, "-U", "postgres", "--auth=scram-sha-256", `--pwfile=${join(tmp, "pw")}`, "--encoding=UTF8", "--locale=C"], { stdio: "inherit" });
  } finally { rmSync(tmp, { recursive: true, force: true }); }
}
async function createDatabases(password: string, port: number) {
  const client = new Client({ host: "127.0.0.1", port, user: "postgres", password, database: "postgres" });
  await client.connect();
  try {
    const { rows } = await client.query<{ datname: string }>("SELECT datname FROM pg_database");
    for (const name of DATABASES) if (!rows.some((row) => row.datname === name)) await client.query(`CREATE DATABASE ${name}`);
    const { rows: [info] } = await client.query<{ version: string }>("SELECT current_setting('server_version') AS version");
    console.log(`PostgreSQL ${info.version} ready on 127.0.0.1:${port} (${DATABASES.join(", ")}). Data: ${dataDir}`);
  } finally { await client.end(); }
}
function running() {
  try { execFileSync(exe("pg_ctl"), ["status", "-D", dataDir], { stdio: "ignore" }); return true; } catch { return false; }
}
async function main() {
  const command = process.argv[2] ?? "start";
  const password = process.env.LOCAL_PG_PASSWORD, port = Number(process.env.LOCAL_PG_PORT ?? 54329);
  if (!password) throw new Error("Set LOCAL_PG_PASSWORD in .env before using local PostgreSQL");
  if (command === "stop") { if (running()) execFileSync(exe("pg_ctl"), ["stop", "-D", dataDir, "-m", "fast", "-w"], { stdio: "inherit" }); else console.log("Local PostgreSQL is not running."); return; }
  if (command === "status") { console.log(existsSync(exe("pg_ctl")) && running() ? `Running (data: ${dataDir})` : "Not running."); return; }
  if (command !== "start") throw new Error(`Unknown command "${command}". Use start, stop or status.`);
  await installBinaries();
  initialise(password);
  if (!running()) execFileSync(exe("pg_ctl"), ["start", "-D", dataDir, "-l", logFile, "-o", `-p ${port} -h 127.0.0.1`, "-w"], { stdio: "ignore" }); // inherited pipes would keep the caller's terminal open
  await createDatabases(password, port);
}
main().catch((error) => { console.error("Local PostgreSQL failed:", error instanceof Error ? error.message : error); process.exit(1); });
