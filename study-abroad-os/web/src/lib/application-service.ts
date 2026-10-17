import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { PoolClient } from "pg";
import {
  applicationPatchSchema,
  applicationSchema,
  makeTasks,
  type Program,
} from "./domain";

export class ApplicationConflictError extends Error {
  constructor() {
    super("แผนนี้ถูกแก้ไขแล้ว กรุณาโหลดข้อมูลล่าสุดก่อนบันทึก");
  }
}
export class ApplicationNotFoundError extends Error {
  constructor() {
    super("ไม่พบแผนสมัครของคุณ");
  }
}
export async function startApplication(
  client: PoolClient,
  userId: string,
  program: Program,
  targetIntake: string,
) {
  const application = applicationSchema.parse({
    id: randomUUID(),
    programId: program.id,
    status: "preparing",
    tasks: makeTasks(program),
    notes: "",
    targetIntake,
    version: 1,
  });
  await client.query(
    "INSERT INTO application(id,user_id,program_id,data,version) VALUES($1,$2,$3,$4,1) ON CONFLICT(user_id,program_id) DO NOTHING",
    [application.id, userId, program.id, JSON.stringify(application)],
  );
  const result = await client.query(
    "SELECT data,version FROM application WHERE user_id=$1 AND program_id=$2",
    [userId, program.id],
  );
  return applicationSchema.parse({
    ...result.rows[0].data,
    version: result.rows[0].version,
  });
}
export async function updateApplication(
  client: PoolClient,
  userId: string,
  input: unknown,
) {
  const command = z
    .object({
      id: z.string().uuid(),
      programId: z.string(),
      expectedVersion: z.number().int().positive(),
      patch: applicationPatchSchema,
    })
    .parse(input);
  const result = await client.query(
    "SELECT data,version FROM application WHERE id=$1 AND user_id=$2 AND program_id=$3 FOR UPDATE",
    [command.id, userId, command.programId],
  );
  if (!result.rowCount) throw new ApplicationNotFoundError();
  if (result.rows[0].version !== command.expectedVersion)
    throw new ApplicationConflictError();
  const application = applicationSchema.parse({
    ...result.rows[0].data,
    ...command.patch,
    id: command.id,
    programId: command.programId,
    version: command.expectedVersion + 1,
  });
  await client.query(
    "UPDATE application SET data=$3,version=$4,updated_at=now() WHERE id=$1 AND user_id=$2",
    [command.id, userId, JSON.stringify(application), application.version],
  );
  return application;
}
