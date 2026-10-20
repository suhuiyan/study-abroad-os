# China University Discovery Register

Local review workspace for identifying which mainland China institutions publish official international undergraduate admissions information. It uses a standalone SQLite database, separate from the Study Abroad OS Neon/production database.

## Current official baseline

- Dataset: 2026 Ministry of Education list of ordinary higher education institutions.
- Published: 2026-06-18; list is current as of 2026-06-17.
- Imported: 2,952 institutions; 1,412 are classified by MOE as undergraduate level.
- The list is a legal institution register, not an admissions list. As of 2026-09-25, 192 records have an official admissions URL attached (`source_found`), 159 were checked but could not be verified (`not_verified`), 1 has evidence of no international undergraduate intake for the named 2026 cycle (`no_current_admissions`), and 2,600 records remain `not_checked` across all levels. Of the 1,412 bachelor-level records, 1,060 remain `not_checked`. None has yet been promoted to `verified_admissions` in this discovery database. A `source_found` URL is not proof of a current intake; check the note and source cycle before relying on it.
- The 97 bachelor records covered by the current manual review batches are Guizhou (5 `source_found`, 5 `not_verified`), Guangxi (2, 8), Shanghai (6, 4), Ningxia (2, 9), Tianjin (16, 16), Tibet (0, 5), Hainan (6 `source_found`, 5 `not_verified`, 1 `no_current_admissions`), and Gansu (4 `source_found`, 3 `not_verified` in the current pass). Gansu has 28 bachelor-level candidate institutions in total; this pass updated 7 records and left others for subsequent research. Some Gansu `source_found` records point to general foreign-student guides whose degree level still needs confirmation. All 32 Tianjin, 5 Tibet, and 12 Hainan bachelor-level records now have review notes. Hainan includes 2026/27 or earlier international guides whose deadlines have passed; the Hainan Lausanne FAQ states it only recruited Gaokao candidates in 2026. Tibet homepages were added where independently confirmed; Lhasa Normal's likely domain timed out and remains unconfirmed. `not_verified` means insufficient qualifying evidence was found, not that the school does not accept international undergraduates.
- Source page: https://www.moe.gov.cn/jyb_xxgk/s5743/s5744/202606/t20260618_1441074.html
- Direct source file: https://www.moe.gov.cn/jyb_xxgk/s5743/s5744/202606/W020260618416094865984.xls
- SHA-256 is recorded in `data/moe-2026.json` and the SQLite `datasets` table.

## Open and use

The imported database is already present at `data/discovery.sqlite3`. Start the local review page from the repository root:

```powershell
& 'C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' discovery/server.py
```

Open http://127.0.0.1:4173. Search in Chinese name, English name, or MOE code; filter by province, level, or review status; select **ตรวจ** to attach the official home/admissions URLs and save a review note; export the full registry as CSV. The page and API bind to loopback only.

## Review status meanings

- `not_checked`: no institution-specific admissions verification yet.
- `source_found`: an official admissions URL is attached; contents/current cycle still need review.
- `needs_review`: a reviewer found a relevant source, but cycle or criteria still need confirmation.
- `verified_admissions`: a reviewer found a current official international undergraduate admissions notice and recorded the evidence URL and cycle in the note.
- `not_verified`: checked, but evidence was insufficient to confirm.
- `no_current_admissions`: official sources reviewed for a named cycle and no undergraduate foreign-student intake was found.

This is a manually reviewed snapshot, not a real-time crawler or alert system for all institutions. `reviewed_at` shows when a record was checked; recheck the official notice before relying on a deadline or applying in a later cycle.

## Current nationwide bachelor queue

The current read-only export of all 1,412 undergraduate-level MOE rows is at `data/agent-runs/2026-09-27-pilot/coverage-queue.csv`; the selection hash and status/province counts are in the adjacent `coverage-manifest.json`. It is generated from the existing register and does not add or infer institutions. Regenerate it after the database changes with:

```powershell
& 'C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' -X utf8 discovery/build_coverage_queue.py --output-dir discovery/data/agent-runs/2026-09-27-pilot --overwrite
```

The command opens SQLite read-only. `--overwrite` is required because the selected output files already exist.

To prepare per-university research tasks for small-model agents without rebuilding the university list, export an input-versioned JSONL queue:

```powershell
& 'C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' -X utf8 discovery/build_research_tasks.py --output-dir discovery/data/agent-runs/2026-09-27-pilot
```

It emits one task for each existing 本科 MOE code, with the exact register-row snapshot, dataset provenance, deterministic `inputVersion`/`taskId`, and a result path. The database is opened read-only. A changed register row or dataset produces a different task identity; the package importer recomputes the same fingerprint before accepting results.
Use `--overwrite` when regenerating these task-export files in the same output directory.

Save one review at a time. Status changes and reviewer notes are preserved in `review_events`. CSV contains all institutions and their latest review state. Avoid recording student personal data in the notes.

## Refresh the MOE baseline

Install the pinned parser into the ignored local vendor folder and rerun extraction:

```powershell
& 'C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' -m pip install --target discovery/.vendor xlrd==2.0.2
& 'C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' discovery/extract_registry.py
```

The extractor validates 2,952 unique MOE codes and 1,412 undergraduate rows before writing. The database importer is intentionally one-time and will not overwrite later human reviews. To import a new MOE vintage, use a separate database file and compare the two exports before merging or replacing records.

## Next research steps

1. Filter to undergraduate institutions.
2. Find each university's official International Admissions office and undergraduate notice.
3. Record the source URL, intake year, publication date, and whether foreign bachelor applicants are accepted.
4. Mark uncertain/conflicting cases `needs_review`; never infer acceptance from an English homepage or scholarship membership.
5. Refresh/verify admissions pages against official changes; then promote only approved candidates to the main product.

## Fast coverage sweep

The prompt workflow includes a read-only first pass over every existing bachelor task. It fetches only URLs already present in the queue, deduplicates requests, limits concurrency per host, records response metadata and hashes, and emits a follow-up queue split into discovery, extraction, and repair stages. It does not write SQLite or verify admissions:

```powershell
& 'C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' -X utf8 discovery/fast_source_sweep.py `
  --queue discovery/data/agent-runs/2026-09-27-pilot/research-tasks.jsonl `
  --output-dir discovery/data/agent-runs/2026-09-27-pilot/fast-sweep-YYYY-MM-DD `
  --workers 8 --timeout 15
```

Review `fast-source-sweep.csv` for whole-queue coverage, then dispatch `fast-follow-up-queue.jsonl` using the role-specific prompts. Candidate pages still require extraction and independent review before any package import.

## Capture source bytes for review

After a fast sweep, capture only the URLs already present in the research queue. The command is read-only for SQLite and production. It saves bounded response bytes under the run directory and writes `source-captures.jsonl` with the requested URL, final URL, HTTP status, content type, timestamp, relative capture path, and SHA-256. A capture is evidence for review; it does not verify admissions or change a university status.

```powershell
& 'C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' -X utf8 discovery/capture_sources.py `
  --queue discovery/data/agent-runs/2026-09-27-pilot/research-tasks.jsonl `
  --output-dir discovery/data/agent-runs/2026-09-27-pilot/source-capture-YYYY-MM-DD `
  --workers 8 --timeout 20 --max-bytes 5000000
```

Each host is limited to one request at a time. Failed fetches remain in the manifest with an error and no capture path; they must not be treated as negative admissions evidence. Keep the run directory as a snapshot before starting extraction or independent review.

This initial release imports the complete MOE ordinary higher education list. It does not claim that every MOE-listed institution is a university in everyday English, accepts foreign students, or has a current undergraduate intake.
