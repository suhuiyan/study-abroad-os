# China 10 release contract

Version: 1.0 (2026-09-23). Scope: the ten existing catalog IDs, one program or admission route each. This contract does not claim coverage of every undergraduate major at those universities.

## Facts and review

An official university, scholarship provider, or Chinese government publication is the authority for a critical fact. A catalog value or successful HTTP fetch is a lead, not a verified fact. Research records proposed facts; a second reviewer resolves each critical field against the original document. No automation changes public program or scholarship facts.

Represent a fact by `fieldPath`, `value` (null when unknown), `status` (`verified|unknown|conflict|not_applicable`), `unknownReason` (`not_announced|not_found_in_checked_sources|source_unreachable|contradictory|applicability_unclear` when applicable), and `evidence[]`. Evidence includes official URL, organization, document title, section or PDF page, publication date if known, and retrieval time. A verified fact additionally has `verifiedAt` and `reviewerId`. Retrieval and verification times are distinct. Never reuse an old `verifiedAt` for a newly changed value.

For admission, record `intake.year`, `intake.month` or season, `intake.round`, program/route identity, teaching language and eligibility scope separately. A cycle date must identify the cycle it applies to. A deadline for scholarship is never an application deadline. Date-only values are calendar dates in China; an exact cutoff time needs explicit official evidence. A 2026 rule does not verify 2027. Keep old-cycle facts identified by year and present the new cycle as unknown until documented.

For scholarships, link each award to the exact program/route, degree, teaching language, applicant group and cycle when the source gives those limits. Coverage records amount, currency, unit, duration and exclusions. A mention of a university scholarship does not establish eligibility for this route or guarantee an award. When research finds no applicable award, the result is `not_found_in_checked_sources`, not a claim that the university offers none.

For HSK, IELTS, CSCA, age, nationality and qualifications, distinguish explicit rule, alternative or exemption, and absent information. Multi-major admission routes may retain `applicability_unclear` until a major is selected. The eligibility engine may give a preliminary gap or match only for a sourced rule that applies to the chosen cycle. An unsourced or wrong-cycle rule stays unknown.

## Backward-compatible mapping

Existing `Program.id` and `universityId` never change in this release. Optional `cycle`, `facts`, `scholarshipFacts`, and `review` structures can be added to the JSONB document. Existing flat `intake`, `opensAt`, `deadline`, `tuition`, `hskLevel`, `hskScore`, `ielts`, `minBand`, `csca`, `source`, `checkedAt`, `verification`, `scholarships` remain readable during migration. New readers must accept legacy records with no `facts`; they must not silently treat the legacy `reviewed` flag as per-field evidence. New writers populate the optional structures and project the flat fields from approved data only. Unknown numeric/date values remain null/empty in the flat projection; never use zero or a guessed day.

Proposed JSON fragments below specify semantics, not a complete new schema:

```json
{"id":"fudan-data-science","intake":"2026","deadline":"2026-03-06","verification":"partial"}
```

```json
{"id":"fudan-data-science","cycle":{"year":2027,"season":"fall","round":"first"},"facts":{"deadline":{"value":"2027-03-06","status":"verified","evidence":[{"url":"https://official.example.edu/2027","organization":"Example University","locator":"Admission / Round 1","retrievedAt":"2026-09-23T01:00:00Z"}],"verifiedAt":"2026-09-23T03:00:00Z","reviewerId":"reviewer-1"}}}
```

```json
{"id":"fudan-data-science","cycle":{"year":2027},"facts":{"deadline":{"value":null,"status":"unknown","unknownReason":"not_announced","evidence":[]}}}
```

```json
{"id":"blcu-chinese-language","cycle":{"year":2027,"season":"spring"},"facts":{"deadline":{"value":null,"status":"conflict","unknownReason":"contradictory","evidence":[{"url":"https://official.example.edu/page-a","locator":"Admission date"},{"url":"https://official.example.edu/page-b","locator":"Admission date"}]}}}
```

The example.edu URLs are illustrative fixtures, never source evidence. A research file must point to real official sources.

## Publication lifecycle and API behavior

`source_document` and `source_version` keep raw fetch history. First successful fetch is a baseline event; a later different SHA-256 is a potential source change, not proof that any admission fact changed. `review_item` preserves the event across subsequent unchanged or failed runs. Allowed lifecycle: `pending -> draft -> approved` or `pending/draft -> rejected`. Approval and program revision are one database transaction with an expected base revision. Concurrent/stale edits return 409. Repeating approval cannot create duplicate revisions. A direct legacy admin update must become a draft or be rejected; it cannot bypass review.

Proposed API contract for implementation tasks:

| Operation | Success | Error cases |
|---|---|---|
| List pending/admin source | 200 paginated | 401 anonymous, 403 non-admin |
| Read raw snapshot | 200 escaped text or attachment | 401/403, 404 missing |
| Create/update draft | 200 or 201, no public mutation | 400 invalid evidence/schema, 401/403, 404, 409 stale |
| Approve/reject | 200 with revision and actor | 400 invalid transition, 401/403, 404, 409 stale/already final |
| Update application | 200 with new version | 400 invalid input, 401 unauthenticated, 404 wrong owner/missing, 409 stale version |
| Infrastructure unavailable | no false success | 503, keep last known published facts |

Implementation chooses route paths within the task allowlist. The response shape is fixed before consumer code is merged. Input source content is untrusted and never rendered as live HTML on the app origin.

## Freshness policy

Research and review dates display separately. Proposed configurable warning threshold for admissions, tuition, and scholarship critical facts is 30 days after `verifiedAt`; it is a warning to recheck, not an automatic assertion that the fact is false. Once the calendar moves beyond an announced deadline, the old cycle is closed, but the new cycle is unknown until its notice exists. A failed fetch keeps the last verified value and adds an error/stale warning. The reviewer may require earlier recheck on a specific source. This threshold is an operational default to validate with users, not a university rule.

## Release ownership and gates

Researcher and reviewer must be separate executions. The ten evidence pairs, five independent reviews, integration/browser checks, and real-student usability checks gate publication. Coordinator assigns reviewer IDs before approval. The project owner must identify the person permitted to run migration, access backups and deploy production; until then L02 remains blocked. Workers receive no production secrets or authority to publish.

No new service, AI provider, authentication layer or schema rewrite is required by this contract. If an official source contradicts this contract's assumptions, document the conflict and have the coordinator version the contract before dependent code is merged.
