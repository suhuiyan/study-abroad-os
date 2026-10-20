# Structured Evidence Store: S4 Design Proposal

Status: design proposal only. No migration or database write is authorized by this artifact.

## Decision

Extend the existing local SQLite discovery database with additive, normalized evidence tables. Keep `universities` as the existing MOE identity/summary register and keep this entire store separate from the production Neon database. Export per-university JSON packages and full CSV views from the relational evidence tables for owner review.

This is preferred over JSON-only storage because the queue has 1,412 bachelor records and the workflow needs indexed lookup by MOE code, cycle, evidence status, reviewer decision, and monitoring due date. JSON remains the interchange/export contract, not the only queryable store.

## Existing Constraints

The current database contains `datasets`, `universities`, and `review_events`. The university row has one `official_homepage`, one `admissions_url`, one summary status, and one free-text `review_note`; it cannot represent multiple sources, cycles, programs, scholarships, evidence citations, or append-only source history. The existing local POST review endpoint replaces both URLs when saving, so it must not be used for imports that do not explicitly patch those fields.

The web production `sourceRegistry` is derived from the MVP catalog's program URLs. Its daily cron is not a nationwide university-discovery monitor and must remain a separate system.

## Proposed Additive Tables

1. `research_packages`: package ID, MOE code FK, schema version, input version/hash, run ID, `as_of`, run state, created timestamp, source dataset ID, canonical package hash, and canonical v1 `contract_payload` JSON. Keeping the envelope preserves task role, output paths, checks, unresolved items, and next action even when they are not separate query columns.
2. `research_scopes`: package FK, stable scope ID, kind (`institution`, `admission`, `program`, `scholarship`), label, original cycle wording, nullable degree level, applicant channel, and program scope.
3. `source_records`: canonical URL identity, publisher, officiality (`confirmed`/`unconfirmed`), and first-seen timestamp. One source may be referenced by many packages.
4. `source_versions`: source FK, final URL, title, published date, fetched timestamp with timezone, HTTP status, retrieval method, capture path, content SHA-256, and error. Store distinct capture observations append-only even when content hashes repeat; deterministic IDs deduplicate only an identical observation. Index `(source_id, sha256)` for content lookups, but do not make that pair unique because later fetch metadata must not be discarded.
5. `evidence`: package FK, source-version FK, short original-language excerpt, locator, language, and stable evidence ID. Do not copy whole copyrighted documents into excerpts.
6. `source_ownership_evidence`: source/evidence join recording which independent evidence establishes a source domain's owner; avoids a circular direct reference from a source row to evidence attached to that same URL.
7. `research_search_events`: package FK, query text, query timestamp, target domain, action, result/limitations, and optional resulting source ID. This preserves the bounded search log, including unsuccessful queries without inventing a source.
8. `claims`: package/scope FK, field, JSON-encoded typed value or NULL, unit, state (`supported`, `unknown`, `conflicting`), notes, and timestamps. Every supported claim must link to readable evidence; unknown values must be NULL; competing facts remain separate and unresolved.
9. `claim_evidence`: many-to-many join between claims and evidence, with FK constraints.
10. `review_decisions`: append-only reviewer identity/type, decision, reviewed timestamp, cycle, per-claim decisions, evidence references, and unresolved items. A model's research conclusion is not a reviewer decision.
11. `source_watch`: approved source ID, configured interval/load group, next due, last attempt, and last successful fetch. Only approved official sources enter this table.
12. `source_check_runs` and `source_check_attempts`: actual run timestamps, URL, final URL, response/status/error, observed hash, changed flag, and diff artifact reference. Failed fetches preserve last-good source versions and facts.
13. `source_review_items`: source/run FK, reason (`content_changed`, `fetch_failed`, `ownership_changed`), status, reviewer decision, and timestamps. Errors mark the source stale/unavailable without changing intake state.
14. `import_events`: unique idempotency key/package version, approved decision reference, applied patch summary, backup reference/hash, timestamp, and before/after read-back hash.

Programs, admission terms, and scholarships are represented as scoped claims with a field vocabulary from `DATA-CONTRACT.md`, rather than inferred from a global university-level value. A bachelor program, its admission cycle, and a scholarship each receive independent scopes and evidence links.

## Integrity and Write Rules

- Foreign keys enabled for every connection; indexes on `universities.moe_code`, `(moe_code, as_of)`, `(scope kind, cycle, degree level)`, claim state, source URL/hash, reviewer decision, and monitoring due.
- Insert/reuse research packages by stable idempotency key. Reimporting an identical accepted package must not create duplicate evidence, versions, claims, or review events.
- No null-to-delete semantics: an unknown extraction cannot erase a previous accepted value. Only a human-approved explicit patch may supersede an accepted claim; prior versions and reviewer decisions stay queryable.
- Fetch errors, 404, timeout, CAPTCHA, or changed content create attempts/review work; they never mutate admission facts or status automatically.
- A changed source version triggers review. Hash change alone is not proof that a requirement changed.
- Every write batch runs in a transaction and must rollback atomically on a validation/FK/conflict error.
- `no_current_admissions` is accepted only when a reviewer cites an explicit official negative statement scoped to a named undergraduate foreign-student cycle. A 404, timeout, missing index result, or expired past-cycle notice cannot satisfy it.
- Before the first write, create a backup using SQLite's backup API and restore it into a temporary database; verify row counts and hashes. Never copy the live DB file blindly while WAL writes are active.
- The importer is the only writer for evidence packages. Summary updates to `universities` must preserve fields outside an explicit approved patch and record `review_events`/`import_events` in the same transaction.

## Contract Mapping and Idempotency

- The JSON envelope must preserve every v1 field: `schemaVersion`, `taskId`, `role`, `runState`, `inputVersion`, `moeCode`, `nameZh`, `asOf`, `officialHomepage`, `recommendedStatus`, `sources`, `evidence`, `scopes`, `claims`, `searchLog`, `outputPaths`, `checks`, `unresolved`, and `nextAction`. Export may not silently drop fields.
- `inputVersion` is SHA-256 over canonical JSON containing the MOE dataset identity/hash plus the exact university-row values supplied to the researcher; it is not a filename or date alone.
- `packageId = SHA256(moeCode + taskId + inputVersion)`. The canonical serialized package also has `packageSha256`. Same package ID and hash is a no-op returning the existing import-event ID. Same package ID with a different hash is rejected as a conflict; never overwrite a reviewed package. A new research run gets a new task ID or input version.
- Reviewer decisions bind to the exact package hash. Changed package content requires a new review decision. Every scope/evidence/source reference must resolve before import begins.
- `sourceId` is global and deterministic from canonical URL (`source:` plus URL encoding); evidence and scope IDs are unique within their package.
- Every SQLite connection used by migration, importer, server, backup verification, and tests must execute `PRAGMA foreign_keys=ON` and assert it returns `1`. Declared foreign keys without connection-level enforcement are insufficient.
- Before applying an approved summary patch, compare the current MOE row/input hash with the package's `inputVersion`. If stale, reject and require rebase/re-review. Omitted fields and unknown claims never clear an existing URL or accepted fact. Clearing requires an explicit human-approved patch with a reason and evidence.
- One transaction inserts the package, versions, evidence, scopes, claims, review decision, import event, and only explicitly approved summary fields. Any validation/FK/conflict error rolls everything back. Historical evidence for another degree must not be promoted as current bachelor status.
- Monitoring diff artifacts contain bounded normalized-text diffs (or hash-only when safe extraction is unavailable), stored under ignored local data with size/retention limits. A hash change creates a review item, never an automatic requirements change.

## Export and Review

- Export one UTF-8 JSON package per MOE code using the v1 contract and a complete evidence index.
- Export a full CSV manifest for the 2,952-register and a bachelor coverage CSV for all 1,412 codes. CSV is a view, not the canonical detail store.
- Review UI must show source title, ownership, cycle, degree/applicant scope, locator, excerpt, retrieval errors, last-good version, and reviewer decision. Keep historical, upcoming, open, closed, stale, and unknown distinct.
- Do not promote unreviewed claims to production. Initial pilot data is currently incomplete for the v1 package contract and is not importable.

## S5 Implementation Split

- S5-A: additive SQLite evidence schema migration, no data import.
- S5-B: SQLite backup/restore helper and restore audit, temporary database only.
- S5-C: v1 JSON package validator and stable IDs/references.
- S5-D: single-writer transactional importer with stale-input, FK, null-preservation, dedupe and rollback behavior.
- S5-E: export package/coverage CSV and JSON, read-only comparison first.
- S5-F: read-only admin review rendering for scoped claims/source versions.
- S8-A: bounded official-source fetch transport and version hashing.
- S8-B: diff/review queue and stale/error behavior.
- S8-C: scheduling only after URLs, load limits, and run evidence are validated.

Each implementation task must have a disjoint write set, temporary-db tests, and explicit acceptance commands before dispatch. Nationwide research remains gated until S6 pilot import, duplicate/rollback/stale-input/preserve-old/backup-restore tests, factual review, and owner risk acknowledgement are complete.
