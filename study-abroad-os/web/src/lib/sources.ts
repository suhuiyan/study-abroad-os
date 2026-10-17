import { createHash } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { db } from "./db";
import { fetchSource, SourceFetchError } from "./source-fetch";
import type { SourceRecord } from "./source-registry";

// The database is the registry (bundled sources come from db:seed, imported ones from the importer).
// Never-checked sources go first, then the stalest, so a run that hits its time budget cannot starve the tail of the list.
export async function loadRegisteredSources(pool: Pool): Promise<SourceRecord[]> {
  const { rows } = await pool.query("SELECT id,url,university_ids FROM source_document ORDER BY last_checked_at ASC NULLS FIRST, id");
  return rows.map(row => ({ id: row.id, url: row.url, universityIds: row.university_ids }));
}

export async function syncSources(options: {
  sources?: SourceRecord[];
  pool?: Pool;
  fetcher?: typeof fetchSource;
  useLock?: boolean;
  timeBudgetMs?: number;
  now?: () => number;
} = {}) {
  const pool = options.pool ?? db();
  const sources = options.sources ?? await loadRegisteredSources(pool);
  const fetcher = options.fetcher ?? fetchSource;
  const now = options.now ?? Date.now;
  const started = now();
  const timeBudgetMs = options.timeBudgetMs ?? 270_000;
  const results: {id:string; status:string}[] = [];
  const deferred: string[] = [];
  let runId: number | null = null;
  let lockClient: PoolClient | null = null;
  if (options.useLock !== false) {
    lockClient = await pool.connect();
    const lock = await lockClient.query("SELECT pg_try_advisory_lock(734921) AS locked");
    if (!lock.rows[0]?.locked) {
      lockClient.release();
      return { results, deferred: sources.map(source => source.id), summary: { status:"already-running", checked:0, changed:0, errors:0 } };
    }
  }
  try {
    const run = await pool.query("INSERT INTO source_check_run(status) VALUES('running') RETURNING id");
    runId = Number(run.rows[0].id);
    for (let sourceIndex = 0; sourceIndex < sources.length; sourceIndex++) {
      const source = sources[sourceIndex];
      if (now() - started >= timeBudgetMs) {
        deferred.push(...sources.slice(sourceIndex).map(item => item.id));
        break;
      }
    let fetched: Awaited<ReturnType<typeof fetchSource>>;
    try {
      fetched = await fetcher(source.url);
    } catch(error) {
      const reason = error instanceof SourceFetchError ? error.code : "NETWORK_ERROR";
      const httpStatus = error instanceof SourceFetchError ? error.httpStatus : null;
      const contentType = error instanceof SourceFetchError ? error.contentType : null;
      const result = await pool.query("UPDATE source_document SET status='error',last_checked_at=now(),last_http_status=$2,content_type=$3,error=$4 WHERE url=$1 RETURNING id",[source.url,httpStatus,contentType,reason]);
      if (!result.rowCount) throw new Error("SOURCE_NOT_SEEDED");
      results.push({id:result.rows[0].id,status:"error"});
      continue;
    }
    const { body, contentType, httpStatus } = fetched;
    const hash = createHash("sha256").update(body).digest("hex");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const existing = await client.query("SELECT id,latest_hash FROM source_document WHERE url=$1 FOR UPDATE",[source.url]);
      if (!existing.rowCount) throw new Error("SOURCE_NOT_SEEDED");
      const sourceId = existing.rows[0].id as string;
      const previousHash = existing.rows[0].latest_hash as string | null;
      const changed = previousHash !== hash;
      const firstFetch = previousHash === null;
      if (changed) await client.query("INSERT INTO source_version(source_id,sha256,content_type,body) VALUES($1,$2,$3,$4) ON CONFLICT(source_id,sha256) DO NOTHING",[sourceId,hash,contentType,body]);
      if (changed && !firstFetch) {
        await client.query(
          `INSERT INTO review_item(run_id,source_id,source_hash,program_id,base_revision,before_data)
           SELECT $1,$2,$3,p.id,COALESCE((SELECT max(pr.id) FROM program_revision pr WHERE pr.program_id=p.id),0),p.data
           FROM program p WHERE p.data->>'universityId'=ANY($4::text[])
           ON CONFLICT(source_id,source_hash,program_id) DO NOTHING`,
          [runId,sourceId,hash,source.universityIds],
        );
      }
      const status = firstFetch ? "baseline" : changed ? "changed" : "same";
      await client.query("UPDATE source_document SET status=$2,last_checked_at=now(),last_changed_at=CASE WHEN $3 THEN now() ELSE last_changed_at END,latest_hash=$4,content_type=$5,last_http_status=$6,error=NULL WHERE id=$1",[sourceId,status,changed,hash,contentType,httpStatus]);
      await client.query("COMMIT");
      results.push({id:sourceId,status});
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
    }
    const changed = results.filter(result => result.status === "changed").length;
    const errors = results.filter(result => result.status === "error").length;
    await pool.query("UPDATE source_check_run SET status='completed',finished_at=now(),checked_count=$2,changed_count=$3,error_count=$4 WHERE id=$1",[runId,results.length,changed,errors]);
    return { results, deferred, summary:{ status:"completed", checked:results.length, changed, errors } };
  } catch (error) {
    if (runId !== null) await pool.query("UPDATE source_check_run SET status='failed',finished_at=now(),error='SOURCE_SYNC_FAILED' WHERE id=$1",[runId]).catch(()=>undefined);
    throw error;
  } finally {
    if (lockClient) {
      await lockClient.query("SELECT pg_advisory_unlock(734921)").catch(()=>undefined);
      lockClient.release();
    }
  }
}
