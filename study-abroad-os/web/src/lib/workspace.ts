import { z } from "zod";
import { applicationSchema, profileSchema, programSchema } from "./domain";

export const workspaceSchema = z.object({
  programs: z.array(programSchema),
  user: z.object({ name: z.string(), email: z.string() }).nullable(),
  profile: profileSchema.nullable(),
  saved: z.array(z.string()),
  applications: z.array(applicationSchema),
  admin: z.boolean().optional(),
  configured: z.boolean(),
  catalogSource: z.enum(["bundled", "database"]).default("bundled"),
});
export type Workspace = z.infer<typeof workspaceSchema>;
export async function readWorkspace(): Promise<Workspace> {
  const response = await fetch("/api/workspace", { cache: "no-store" });
  if (!response.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ กรุณาลองอีกครั้ง");
  const parsed = workspaceSchema.safeParse(await response.json());
  if (!parsed.success)
    throw new Error("รูปแบบข้อมูลไม่สมบูรณ์ กำลังแสดงชุดข้อมูลที่มากับเว็บ");
  return parsed.data;
}
