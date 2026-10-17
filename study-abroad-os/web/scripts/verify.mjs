import { spawnSync } from "node:child_process";

// Empty DATABASE_URL prevents this verification run from accessing any real database.
for (const script of ["lint", "test", "build", "test:e2e"]) {
  const result = spawnSync(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", script],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
      env: { ...process.env, DATABASE_URL: "" },
    },
  );
  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) process.exit(result.status ?? 1);
}
