import { createHash } from "node:crypto";
import { sourceRegistry } from "./catalog";
import { db } from "./db";

const maxBytes = 4 * 1024 * 1024;
export async function syncSources() {
  const results: {id:string; status:string}[] = [];
  for (const source of sourceRegistry) {
    try {
      const response = await fetch(source.url, {signal:AbortSignal.timeout(12000),headers:{"User-Agent":"StudyAbroadOS-MVP/0.1 (+source-check; contact via repository)","Accept":"text/html,application/pdf;q=0.9,*/*;q=0.5"},cache:"no-store"});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const length = Number(response.headers.get("content-length") || 0);
      if (length > maxBytes) throw new Error("SOURCE_TOO_LARGE");
      const body = Buffer.from(await response.arrayBuffer());
      if (body.byteLength > maxBytes) throw new Error("SOURCE_TOO_LARGE");
      const hash = createHash("sha256").update(body).digest("hex");
      const contentType = response.headers.get("content-type")?.split(";")[0] ?? "application/octet-stream";
      const client = await db().connect();
      try {
        await client.query("BEGIN");
        const existing = await client.query("SELECT latest_hash FROM source_document WHERE id=$1 FOR UPDATE",[source.id]);
        if (!existing.rowCount) throw new Error("SOURCE_NOT_SEEDED");
        const changed = existing.rows[0].latest_hash !== hash;
        if (changed) await client.query("INSERT INTO source_version(source_id,sha256,content_type,body) VALUES($1,$2,$3,$4) ON CONFLICT(source_id,sha256) DO NOTHING",[source.id,hash,contentType,body]);
        await client.query("UPDATE source_document SET status=$2,last_checked_at=now(),last_changed_at=CASE WHEN $3 THEN now() ELSE last_changed_at END,latest_hash=$4,content_type=$5,last_http_status=$6,error=NULL WHERE id=$1",[source.id,changed?"changed":"same",changed,hash,contentType,response.status]);
        await client.query("COMMIT");
        results.push({id:source.id,status:changed?"changed":"same"});
      } catch (error) { await client.query("ROLLBACK"); throw error; }
      finally { client.release(); }
    } catch(error) {
      const reason = error instanceof Error ? error.message.slice(0,180) : "UNKNOWN_ERROR";
      await db().query("UPDATE source_document SET status='error',last_checked_at=now(),error=$2 WHERE id=$1",[source.id,reason]);
      results.push({id:source.id,status:"error"});
    }
  }
  return results;
}
