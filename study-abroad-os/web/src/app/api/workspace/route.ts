import { db, databaseConfigured } from "@/lib/db";
import { getAuth } from "@/lib/auth";
import { catalog } from "@/lib/catalog";
import { profileSchema, programSchema } from "@/lib/domain";
import { ApplicationConflictError, ApplicationNotFoundError, startApplication, updateApplication } from "@/lib/application-service";
export const dynamic = "force-dynamic";
const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function GET(request: Request) {
  if (!databaseConfigured()) return json({ programs: catalog, user: null, profile: null, saved: [], applications: [], configured: false, catalogSource: "bundled" });
  try {
    const storedPrograms = (await db().query("SELECT data FROM program ORDER BY id")).rows.map(r => r.data);
    const programs = storedPrograms.length ? programSchema.array().parse(storedPrograms) : catalog;
    const catalogSource = storedPrograms.length ? "database" : "bundled";
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) return json({ programs, user: null, profile: null, saved: [], applications: [], configured: true, catalogSource });
    const id = session.user.id;
    const [profile, saved, apps, admin] = await Promise.all([
      db().query("SELECT data FROM student_profile WHERE user_id=$1", [id]),
      db().query("SELECT program_id FROM shortlist WHERE user_id=$1 ORDER BY created_at DESC", [id]),
      db().query("SELECT data,version FROM application WHERE user_id=$1 ORDER BY updated_at DESC", [id]),
      db().query("SELECT user_id FROM admin_user WHERE user_id=$1", [id]),
    ]);
    return json({ programs, user: {name: session.user.name, email: session.user.email}, profile: profile.rows[0]?.data ?? null, saved: saved.rows.map(r => r.program_id), applications: apps.rows.map(r => ({...r.data,version:r.version})), admin: admin.rowCount === 1, configured: true, catalogSource });
  } catch { return json({ error: "เชื่อมต่อข้อมูลไม่ได้ กรุณาลองใหม่" }, 503); }
}
// request.url can carry an internal host (next start reports localhost for 127.0.0.1; proxies rewrite hosts),
// so the configured public URL is also accepted as this app's origin.
function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const allowed = [new URL(request.url).origin];
  if (process.env.BETTER_AUTH_URL) allowed.push(new URL(process.env.BETTER_AUTH_URL).origin);
  return allowed.includes(origin);
}
export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({error:"คำขอไม่ถูกต้อง"},403);
  try {
    const session = await getAuth().api.getSession({ headers: request.headers });
    if (!session) return json({ error: "กรุณาเข้าสู่ระบบ" }, 401);
    const text = await request.text();
    if (text.length > 64000) return json({error:"ข้อมูลใหญ่เกินไป"},413);
    let body: unknown;
    try { body = JSON.parse(text); } catch { return json({error:"JSON ไม่ถูกต้อง"},400); }
    const id = session.user.id;
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
          if (typeof command.programId !== "string") return json({error:"ไม่พบหลักสูตร"},404);
          const row = await client.query("SELECT data FROM program WHERE id=$1",[command.programId]);
          if (!row.rowCount) return json({error:"ไม่พบหลักสูตร"},404);
          let targetIntake = typeof command.targetIntake === "string" ? command.targetIntake.trim() : "";
          if (!targetIntake) targetIntake = (await client.query("SELECT data->>'intake' AS intake FROM student_profile WHERE user_id=$1",[id])).rows[0]?.intake ?? "";
          if (!/^20\d{2}(?:-(?:0[1-9]|1[0-2]))?$/.test(targetIntake)) return json({error:"กรุณาระบุปีเข้าเรียนเป็น YYYY หรือ YYYY-MM"},400);
          const app = await startApplication(client,id,row.rows[0].data,targetIntake);
          await client.query("INSERT INTO activity_event(user_id,event) VALUES($1,$2)",[id,command.action]);
          await client.query("COMMIT"); committed = true;
          return json({ok:true,application:app});
        }
        case "application": {
          try {
            const app = await updateApplication(client,id,command.data);
            await client.query("INSERT INTO activity_event(user_id,event) VALUES($1,$2)",[id,command.action]);
            await client.query("COMMIT"); committed = true;
            return json({ok:true,application:app});
          } catch (error) {
            if (error instanceof ApplicationConflictError) return json({error:error.message,code:"APPLICATION_CONFLICT"},409);
            if (error instanceof ApplicationNotFoundError) return json({error:error.message},404);
            if (error instanceof TypeError || (error && typeof error === "object" && "issues" in error)) return json({error:"ข้อมูลแผนสมัครไม่ถูกต้อง ต้องส่ง expectedVersion และ field ที่แก้"},400);
            throw error;
          }
        }
        case "program": {
          if (!(await client.query("SELECT user_id FROM admin_user WHERE user_id=$1",[id])).rowCount) return json({error:"เฉพาะผู้ดูแลข้อมูล"},403);
          return json({error:"การแก้หลักสูตรต้องสร้าง draft และอนุมัติผ่านคิวผู้ดูแล"},409);
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
