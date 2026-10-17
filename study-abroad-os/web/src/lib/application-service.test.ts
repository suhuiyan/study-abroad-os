import assert from "node:assert/strict";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import type { PoolClient } from "pg";
import { catalog } from "./catalog";
import {
  startApplication,
  updateApplication,
  ApplicationConflictError,
  ApplicationNotFoundError,
} from "./application-service";

test("application service preserves ownership, idempotency and optimistic versions", async (context) => {
  const database = new PGlite();
  context.after(() => database.close());
  await database.exec(
    "CREATE TABLE application(id uuid PRIMARY KEY, user_id text NOT NULL, program_id text NOT NULL, data jsonb NOT NULL, version integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id,program_id))",
  );
  const client = {
    query: async (sql: string, values: unknown[]) => {
      const result = await database.query(sql, values);
      return {
        rows: result.rows,
        rowCount: result.rows.length || result.affectedRows,
      };
    },
  } as unknown as PoolClient;
  const first = await startApplication(
    client,
    "test-owner",
    catalog[0],
    "2027",
  );
  const second = await startApplication(
    client,
    "test-owner",
    catalog[0],
    "2028",
  );
  assert.equal(second.id, first.id);
  assert.equal(second.targetIntake, "2027");
  const command = {
    id: first.id,
    programId: first.programId,
    expectedVersion: 1,
    patch: { notes: "ทดสอบโน้ต" },
  };
  await assert.rejects(
    updateApplication(client, "other-owner", command),
    ApplicationNotFoundError,
  );
  const updated = await updateApplication(client, "test-owner", command);
  assert.equal(updated.notes, "ทดสอบโน้ต");
  assert.equal(updated.version, 2);
  assert.deepEqual(updated.tasks, first.tasks);
  await assert.rejects(
    updateApplication(client, "test-owner", command),
    ApplicationConflictError,
  );
});
