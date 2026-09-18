import { db, databaseConfigured } from "@/lib/db";
import { getAuth } from "@/lib/auth";
import { catalog } from "@/lib/catalog";
import { applicationSchema, makeTasks, profileSchema, programSchema } from "@/lib/domain";
import { randomUUID } from "node:crypto";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function GET(request: Request) {
  if (!databaseConfigured()) return json({ programs: catalog, user: null, profile: null, saved: [], applications: [], configured: false });
  try {
    const storedPrograms = (await db().query("SELECT data FROM program ORDER BY id")).rows.map(r => r.data);
    const programs = storedPrograms.length ? storedPrograms : catalog;
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) return json({ programs, user: null, profile: null, saved: [], applications: [], configured: true });
    const id = session.user.id;
    const [profile, saved, apps, admin] = await Promise.all([
      db().query("SELECT data FROM student_profile WHERE user_id=$1", [id]),
      db().query("SELECT program_id FROM shortlist WHERE user_id=$1 ORDER BY created_at DESC", [id]),
      db().query("SELECT data FROM application WHERE user_id=$1 ORDER BY updated_at DESC", [id]),
      db().query("SELECT user_id FROM admin_user WHERE user_id=$1", [id]),
    ]);
    return json({ programs, user: {name: session.user.name, email: session.user.email}, profile: profile.rows[0]?.data ?? null, saved: saved.rows.map(r => r.program_id), applications: apps.rows.map(r => r.data), admin: admin.rowCount === 1, configured: true });
  } catch { return json({ error: "เชื่อมต่อข้อมูลไม่ได้ กรุณาลองใหม่" }, 503); }
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) return json({error:"คำขอไม่ถูกต้อง"},403);
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);
    const text = await request.text();
    if (text.length > 64000) return json({error:"ข้อมูลใหญ่เกินไป"},413);
    const body: unknown = JSON.parse(text), id = session.user.id;
    if (!body || typeof body !== "object") return json({error:"ข้อมูลไม่ถูกต้อง"},400);
    const command = body as Record<string, unknown>;
    const client = await db().connect();
    let committed = false;
    try {
      await client.query("BEGIN");
      switch (command.action) {
        case "profile": {
          const parsed = profileSchema.safeParse(command.data);
          if (!parsed.success) return json({error:"กรุณาตรวจข้อมูลโปรไฟล์"},400);
          await client.query("INSERT INTO student_profile(user_id,data) VALUES($1,$2) ON CONFLICT(user_id) DO UPDATE SET data=$2, updated_at=now()",[id,JSON.stringify(parsed.data)]);
          break;
        }
        case "save": {
          if (typeof command.programId !== "string" || typeof command.saved !== "boolean") return json({error:"ข้อมูลไม่ถูกต้อง"},400);
          if (!(await client.query("SELECT id FROM program WHERE id=$1",[command.programId])).rowCount) return json({error:"ไม่พบหลักสูตร"},404);
          if (command.saved) await client.query("INSERT INTO shortlist(user_id,program_id) VALUES($1,$2) ON CONFLICT DO NOTHING", [id,command.programId]);
          else await client.query("DELETE FROM shortlist WHERE user_id=$1 AND program_id=$2", [id,command.programId]);
          break;
        }
        case "start": {
          if (typeof command.programId !== "string" || !(await client.query("SELECT id FROM program WHERE id=$1", [command.programId])).rowCount) return json({error:"ไม่พบหลักสูตร"},404);
          const program = (await client.query("SELECT data FROM program WHERE id=$1",[command.programId])).rows[0]?.data;
          const app = { id: randomUUID(), programId: command.programId, status: "preparing", tasks: makeTasks(program), notes: "", targetIntake: "2027" };
          await client.query("INSERT INTO application(id,user_id,program_id,data) VALUES($1,$2,$3,$4) ON CONFLICT(user_id,program_id) DO NOTHING",[app.id,id,app.programId,JSON.stringify(app)]);
          break;
        }
        case "application": {
          const parsed = applicationSchema.safeParse(command.data);
          if (!parsed.success) return json({error:"ข้อมูลแผนสมัครไม่ถูกต้อง"},400);
          const app = parsed.data;
          const result = await client.query("UPDATE application SET data=$1, updated_at=now() WHERE id=$2 AND user_id=$3 AND program_id=$4",[JSON.stringify(app),app.id,id,app.programId]);
          if (!result.rowCount) return json({error:"ไม่พบแผนสมัคร"},404);
          break;
        }
        case "program": {
          if (!(await client.query("SELECT user_id FROM admin_user WHERE user_id=$1",[id])).rowCount) return json({error:"เฉพาะผู้ดูแลข้อมูล"},403);
          const parsed = programSchema.safeParse(command.data);
          if (!parsed.success) return json({error:"ข้อมูลหลักสูตรไม่ถูกต้อง"},400);
          const p = parsed.data;
          await client.query("INSERT INTO program(id,data) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET data=$2, updated_at=now()",[p.id,JSON.stringify(p)]);
          await client.query("INSERT INTO program_revision(program_id,actor,data) VALUES($1,$2,$3)",[p.id,id,JSON.stringify(p)]);
          break;
        }
        default: return json({error:"ไม่รู้จักคำสั่ง"},400);
      }
      await client.query("INSERT INTO activity_event(user_id,event) VALUES($1,$2)",[id,command.action]);
      await client.query("COMMIT");
      committed = true;
      return json({ok:true});
    } finally {
      if (!committed) await client.query("ROLLBACK");
      client.release();
    }
  } catch { return json({error:"บันทึกไม่สำเร็จ กรุณาลองใหม่"},503); }
}
