import { syncSources } from "@/lib/sources";
export const maxDuration = 300;
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) return Response.json({error:"Cron not configured"},{status:503});
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return Response.json({error:"Unauthorized"},{status:401});
  try { return Response.json({results:await syncSources()}); }
  catch { return Response.json({error:"Source check unavailable"},{status:503}); }
}
