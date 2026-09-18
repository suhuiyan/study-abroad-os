import { getAuth } from "@/lib/auth";
export async function GET(request: Request) {
  try { return await getAuth().handler(request); }
  catch { return Response.json({ message: "ระบบสมาชิกยังไม่พร้อม กรุณาลองใหม่ภายหลัง" }, { status: 503 }); }
}
export const POST = GET;
