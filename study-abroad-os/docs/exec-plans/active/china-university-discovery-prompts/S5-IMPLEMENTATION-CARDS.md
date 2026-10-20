# S5 Implementation Task Cards

Status: ready for review; no task is dispatched and no migration is applied. All work is confined to the local discovery workspace and temporary test databases. Production, Neon, Vercel, secrets, and the real SQLite file as a write target are forbidden.

Repository root: `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os`
Python runtime: `C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`
Shared contract: `docs/exec-plans/active/china-university-discovery-prompts/DATA-CONTRACT.md`
S4 design: `discovery/STRUCTURED-EVIDENCE-DESIGN.md`

## S5-A: Additive Evidence Schema

**Role:** Coding. **Priority:** P0. **Estimate:** Large; one migration slice only.

**Goal/scope:** Add versioned, additive SQLite schema for research packages, scopes, source identity/versions, ownership evidence, excerpts, search events, claims, claim-evidence links, reviewer decisions, and import events. Preserve the existing MOE register and legacy APIs. Do not create the source-monitoring scheduler in this task.

**Read:** `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/server.py`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/extract_registry.py`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/docs/exec-plans/active/china-university-discovery-prompts/DATA-CONTRACT.md`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/STRUCTURED-EVIDENCE-DESIGN.md`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/README.md`.

**Allowed edits:** `discovery/migrations/001_research_evidence.sql`; `discovery/migrate_evidence.py`; `discovery/test_migrate_evidence.py` only.

**Forbidden:** `discovery/data/discovery.sqlite3`; `web/**`; `.env*`; other task files.

**Steps:** inspect actual schema; create a migration ledger/version; create core tables and indexes with FK references and a canonical contract-payload column; make migration repeat-safe without swallowing partial failures; write temporary-database tests for fresh schema, existing register preserved, FK enforcement, and already-applied migration.

**Acceptance:** migration runs only against a caller-supplied path; legacy table/row/hash stay unchanged in temp copy; `PRAGMA foreign_keys=ON` is checked on every connection opened by the new module; all expected tables/indexes exist; rerun is a no-op; invalid migration rolls back; no import of university facts occurs.

**Checks:** `& 'C:/Users/Asus/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe' -X utf8 -B -m unittest discovery.test_migrate_evidence` from repo root. Exit 0; use temp DB only.

**Failure stop:** unknown SQLite version/locking issue, dirty-state conflict in listed files, or any need to alter the real discovery DB. **Risk:** a non-additive migration could corrupt the only local MOE snapshot. **Depends on:** S4 design review. **Parallel:** S5-C validator (disjoint write set).

## S5-B: Backup and Restore Audit Helper

**Role:** Coding. **Priority:** P0. **Estimate:** Medium.

**Goal/scope:** Implement SQLite backup-API backup and restore verification reusable by importer, without applying an importer or modifying the real database.

**Read:** `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/STRUCTURED-EVIDENCE-DESIGN.md`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/server.py`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/docs/exec-plans/active/china-university-discovery-prompts/DATA-CONTRACT.md`.

**Allowed edits:** `discovery/backup_restore.py`; `discovery/test_backup_restore.py` only.

**Forbidden:** real discovery DB writes, `server.py`, production/Neon/Vercel, secrets.

**Acceptance:** backup uses `sqlite3.Connection.backup`, records source/backup SHA and table/row counts, restores to a new temporary path, verifies integrity and counts, handles WAL mode, and never deletes/overwrites its input. Failure leaves source unchanged.

**Checks:** `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/python.exe -X utf8 -B -m unittest discovery.test_backup_restore` from root; temp DB fixtures only.

**Failure stop:** backup cannot be verified or requires copying the live DB file. **Risk:** false backup success would make later imports unsafe. **Depends on:** S5-A. **Parallel:** S5-C validator.

## S5-C: v1 Package Validator

**Role:** Coding. **Priority:** P0. **Estimate:** Medium.

**Goal/scope:** Validate the exact DATA-CONTRACT v1 envelope, allowed enum values, input hashes, stable IDs, and all source/evidence/scope/claim/review references. Validator rejects malformed or unsupported facts; it does not browse, approve, or repair packages.

**Read:** `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/docs/exec-plans/active/china-university-discovery-prompts/DATA-CONTRACT.md`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/WORKER-PROMPTS.md`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/STRUCTURED-EVIDENCE-DESIGN.md`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/data/agent-runs/2026-09-27-pilot/reviews/pilot-research-results.json` as known incomplete examples, not accepted inputs.

**Allowed edits:** `discovery/package_validator.py`; `discovery/test_package_validator.py`; `discovery/tests/fixtures/package-validator/**` only.

**Forbidden:** database writes, other source modules, production or secrets.

**Acceptance:** supported claims require evidence IDs resolving to readable source/evidence with locators; unknown values are null; `no_current_admissions` requires cycle-scoped official negative evidence and reviewer decision; degree/cycle/channel scopes cannot be inherited; duplicate IDs, broken references, invalid URLs/timestamps/enums, payload/hash mismatch, unknown keys that lose data, and missing envelope fields are rejected. Provide specific error paths without echoing secret-like values.

**Checks:** `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/python.exe -X utf8 -B -m unittest discovery.test_package_validator` from root.

**Failure stop:** ambiguity in DATA-CONTRACT requiring a policy decision; return the exact field and example. **Risk:** permissive validation can turn unknown into published eligibility. **Depends on:** contract mapping in S4. **Parallel:** S5-A migration (disjoint files).

## S5-D: Transactional Package Importer

**Role:** Coding. **Priority:** P0. **Estimate:** Large; import logic only.

**Goal/scope:** Import only validator-passing, human-reviewed packages into a database path explicitly supplied by caller. Use one transaction and an explicit approved summary patch; identical imports are idempotent, conflicts/stale inputs reject.

**Read:** `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/STRUCTURED-EVIDENCE-DESIGN.md`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/server.py`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/package_validator.py`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/backup_restore.py`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/docs/exec-plans/active/china-university-discovery-prompts/DATA-CONTRACT.md`.

**Allowed edits:** `discovery/import_package.py`; `discovery/test_import_package.py` only.

**Forbidden:** `discovery/data/discovery.sqlite3` as test/command target; any production database/secret; UI/API changes.

**Acceptance:** requires explicit DB path, accepted reviewer decision bound to package hash, and an existing backup whose file digest, manifest path, snapshot digest, restored counts/integrity, and logical contents match the target immediately before import; stale MOE input blocks both new imports and replay after any later row/dataset change (an unchanged replay is a no-op, including the explicitly approved patch result); same ID/different hash rejects; exact pre-research row snapshot is stored; missing/unknown fields never clear existing URLs/accepted facts; summary patch approval binds to package hash, exact field/value map, human reviewer, reason, and relevant accepted evidence; explicit clearing requires reason/evidence; each distinct source capture observation is append-only even when content SHA repeats; all inserts and summary updates commit atomically; injected failure rolls back all tables; FK violations reject; `no_current_admissions` cannot be imported without an official named-cycle negative claim.

**Checks:** `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/python.exe -X utf8 -B -m unittest discovery.test_import_package` from root; tests must use temporary copies and prove input DB hash unchanged.

**Failure stop:** no reviewer/hash, stale input, failed backup, unresolved conflict, or a required write outside approved patch. **Risk:** bad import can overwrite trusted university data. **Depends on:** S5-A, S5-B, S5-C. **Parallel:** S5-E export after S5-A; never run writer tasks concurrently on one database.

## S5-E: Evidence Exporter and Coverage View

**Role:** Coding. **Priority:** P1. **Estimate:** Medium.

**Goal/scope:** Produce UTF-8 per-MOE v1 JSON packages and register/bachelor CSV coverage from a read-only database. Export all 2,952 register rows and the exact 1,412 bachelor subset; do not rebuild identities from web search.

**Read:** `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/STRUCTURED-EVIDENCE-DESIGN.md`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/docs/exec-plans/active/china-university-discovery-prompts/DATA-CONTRACT.md`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/server.py`.

**Allowed edits:** `discovery/export_evidence.py`; `discovery/test_export_evidence.py` only.

**Forbidden:** database writes/migrations, `server.py`/`index.html`, production, secrets.

**Acceptance:** deterministic export preserves Chinese text, null/unknown/conflicting distinctions, all contract fields and references; summary CSV lists each MOE code once with province/status/homepage/admissions URL/last-reviewed; coverage counts are global, not page-1 counts; Excel formula-leading cells are escaped; export hash/row counts recorded; running export leaves DB hash unchanged.

**Checks:** `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/python.exe -X utf8 -B -m unittest discovery.test_export_evidence` from root; fixture/temp DB only.

**Failure stop:** source references cannot be resolved or package v1 cannot round-trip. **Risk:** lossy export hides unknowns or drops evidence. **Depends on:** S5-A, S5-C. **Parallel:** S5-D only on disjoint temporary DB fixtures; do not share a write DB.

## S5-F: Read-only Evidence Review UI

**Role:** Coding. **Priority:** P1. **Estimate:** Medium.

**Goal/scope:** Extend the private loopback discovery page to open one MOE record and inspect sources, source versions/errors, evidence locators, scoped claims, unresolved items, and review decisions. This task is read-only; do not add review-write behavior.

**Read:** `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/server.py`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/index.html`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/STRUCTURED-EVIDENCE-DESIGN.md`; `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/discovery/README.md`; nested `web/AGENTS.md` only if touching `web/` (not allowed here).

**Allowed edits:** `discovery/server.py`; `discovery/index.html`; `discovery/test_evidence_views.py` only.

**Forbidden:** all `web/**`, DB schema/importer files, real DB writes, production and secrets.

**Acceptance:** local GET endpoints return evidence only for known MOE codes, escape HTML, keep HTTP(S) source links explicit, show historical/current/unknown/stale distinctly, display source access errors without implying non-admission, and preserve the existing register filters/export. API and UI tests use temporary DB; server remains loopback-only.

**Checks:** `C:/Users/Asus/OneDrive/ドキュメント/ChatGPT/Bring me/study-abroad-os/python.exe -X utf8 -B -m unittest discovery.test_evidence_views` from root; manual browser check after server start against a disposable copy.

**Failure stop:** route requires external/public binding, leaks private student data, or cannot preserve existing worktree changes. **Risk:** reviewers could confuse domestic/historical claims with current foreign admissions. **Depends on:** S5-A, S5-E. **Can parallelize:** only after schema names freeze and with disjoint tests.

## S8 Monitoring Cards (Deferred Until S5 Evidence Tables Exist)

- S8-A: schedule/watch schema and bounded fetch transport, max 20 approved URLs per task; separate from product `sourceRegistry`.
- S8-B: append-only fetch attempts, last-good versions, content-hash and bounded normalized-text diff; errors never clear data or change admission status.
- S8-C: scheduler wiring and a real run; must report schedule, actual run ID, URL coverage and success/error fixtures before claiming monitoring is live.

These are separate tasks and cannot be merged into one worker request. No code or external requests may use CAPTCHA/login bypass.
