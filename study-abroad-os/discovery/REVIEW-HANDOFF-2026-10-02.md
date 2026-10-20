# China University Discovery: Owner Review Handoff

Prepared 2026-10-02 for a manual review of the nationwide research process and Batch 18. The files below are local research artifacts, not admissions data approved for publication. This handoff does not change the source discovery database or production.

## Start here

1. `discovery/data/agent-runs/2026-09-27-pilot/BEIJING-RESEARCH-BATCH-18.md` is the latest five-university research memo. It is a coordinator memo, not an independent review.
2. `discovery/data/agent-runs/2026-09-27-pilot/research-tasks.jsonl` is the 1,412-row identity and input-version queue. Search by MOE code or Chinese name; check each `taskId` and `inputVersion` against the memo.
3. `discovery/data/agent-runs/2026-09-27-pilot/fast-sweep-2026-09-30/fast-source-sweep.csv` is the readable coverage table. The JSONL beside it has URL-level retrieval metadata and hashes. These statuses only prioritize further research.
4. `docs/exec-plans/active/china-university-discovery-prompts/DATA-CONTRACT.md` defines what a supported claim and accepted package require. `WORKER-PROMPTS.md` and `FAST-RESEARCH-PROMPTS.md` define worker and reviewer roles.
5. `discovery/data/agent-runs/2026-09-27-pilot/state.json` and `CHECKPOINT.md` record progress, but have inconsistencies noted below. Do not use them alone as proof of review completion.

## What the bundle contains

- Research memos: `BEIJING-RESEARCH-BATCH-01.md` through `BEIJING-RESEARCH-BATCH-18.md`, plus `PILOT-REPORT.md` and `CHECKPOINT.md`.
- Coverage and work queues: `coverage-queue.csv`, `coverage-manifest.json`, `research-tasks.jsonl`, `research-tasks-manifest.json`, `state.json`, and all four files in `fast-sweep-2026-09-30/`.
- Existing pilot review artifacts in `reviews/`, the one Tsinghua package in `results/`, and the ten pilot task cards in `tasks/`. These are not Batch 18 reviews or packages.
- Rules and workflow: the full `china-university-discovery-prompts/` folder, `discovery/README.md`, and `discovery/STRUCTURED-EVIDENCE-DESIGN.md`.
- Relevant code and tests for reproducibility: the Python source, SQL migration, package validator/importer, and discovery tests. Source register metadata and the MOE source spreadsheet/JSON are included. The separate local SQLite database is not in the ZIP because it is a mutable working database; the coverage CSV is its reviewable export.

## Batch 18 owner checklist

| MOE code | University | Source to inspect first | Key question | Current memo conclusion |
| --- | --- | --- | --- | --- |
| `4112010859` | 天津天狮学院 | [University homepage](https://www.tianshi.edu.cn/), [Tianjin government identity page](https://www.tj.gov.cn/zwgk/ggqsydwxxgk/jy/ptbkgx/202409/t20240918_6731811.html) | Is there a current official inbound foreign bachelor's notice? | Unknown |
| `4112011032` | 天津职业大学 | [Official admissions site](https://zs.tjtc.edu.cn/), [2026 ordinary admissions charter](https://zs.tjtc.edu.cn/info/1258/2595.htm) | Is there a separate foreign vocational-bachelor route? | Unknown |
| `4112012105` | 天津中德应用技术大学 | [2025 international brochure](https://yywy.tsguas.edu.cn/info/1127/2661.htm), [international education site](https://engjzs.tsguas.edu.cn/) | Is there a current-cycle prospectus? Resolve the brochure's contradictory age wording before using eligibility rules. | Historical international bachelor's route found; current cycle unknown |
| `4112012723` | 天津警察学院 | [2026 charter on official admissions platform](https://gaokao.chsi.com.cn/zsgs/zhangcheng/listVerifedZszc--method-view%2CschId-1206%2CinfoId-7635453697.dhtml) | Does a non-police bachelor's program admit foreign applicants? The police-major Chinese-nationality rule has limited scope. | Other foreign route unknown |
| `4112013658` | 天津外国语大学滨海外事学院 | [Official 2026 ordinary undergraduate charter](https://bhws.tjfsu.edu.cn/zsxx/p.jsp?id=209&pagenum=1&type=1), [outbound Japan project](https://bhws.tjfsu.edu.cn/gjjl/p.jsp?id=422&pagenum=1&type=2) | Is there an inbound foreign bachelor's route, distinct from the outbound project? | Unknown |

For each assertion, check institution identity, source ownership, degree level, foreign applicant channel, application cycle, publication date, original excerpt, and whether the source actually supports the exact claim. Mark missing details `unknown`; a search failure is not proof that admissions do not exist.

## Known review blockers

1. Batch 18 memo shortens the actual queue `taskId` for MOE `4112012105` and `4112013658`. `state.json` has the correct full IDs. The memo must be corrected before an automated join.
2. The generated `fast-follow-up-queue.jsonl` has 161 `stage` values inconsistent with the current `discovery/fast_source_sweep.py` routing: 59 failed/blocked, 93 reachable-needs-review, and 9 reachable-unreadable rows. Rebuild this follow-up artifact from the existing sweep results before dispatching workers.
3. The sweep records 437 unique URL observations with a SHA-256 but no `capturePath` or saved raw page. A hash without the captured bytes cannot independently prove a quoted claim. The official source must be captured for package-level review.
4. No evidence package or independent review exists yet for any of the five Batch 18 tasks. Earlier `reviews/` files are for different tasks.
5. `state.json` repeats review keys inside Batch 03 and claims both complete and pending review. The `CHECKPOINT.md` historical log also contains superseded status statements. Reconcile with actual review artifacts before treating these files as a current summary.
6. The 2025 brochure for MOE `4112012105` lists an over-18 eligibility rule and also asks under-18 applicants for guardianship paperwork. Do not turn either into a current-cycle rule without clarification from the university.
7. Re-running the sweep in the same output directory overwrites the earlier files. Preserve this ZIP/run as a snapshot when doing further research.

## Acceptance record for owner

For each of the five Batch 18 rows, record `accepted`, `changes_required`, or `rejected` for the memo. Separately record the international bachelor's route and current-cycle status as `supported` or `unknown`, with the official URL and the exact section or PDF page. Only an independently reviewed package that satisfies `DATA-CONTRACT.md` can be considered for import. No Batch 18 data is currently import-ready.
