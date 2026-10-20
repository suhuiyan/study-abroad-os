# R08A Admission Evidence: BLCU Chinese Language

Research status: READY_FOR_REVIEW; statuses are proposed for independent review.
Program record: `blcu-chinese-language` / Beijing Language and Culture University / Chinese Language.
Retrieved: 2026-09-23 (Asia/Shanghai, UTC+08:00).
Contract: China 10 release contract v1.0 (2026-09-23); B01 report status ACCEPTED.

## Official sources

| ID | Source | Publication / locator | Notes |
|---|---|---|---|
| S1 | [Undergraduate entry requirements (task seed)](https://admission.blcu.edu.cn/en/384/list.htm) | BLCU International Admission Office; checked 2026-09-23; Application Eligibility, Application Dates, Programs for International Students Only, Application Materials/Procedures, Contacts | Accessible. The content is also served at `/en/39/list.htm`. Page has no visible current publication date. Contains a stale/contradictory September date retained below. |
| S2 | [Undergraduate Programs Taught in Chinese](https://admission.blcu.edu.cn/en/38/list.htm) | Checked 2026-09-23; “MAJOR LIST B.A. (For foreign students only, 4-year program)” | Lists “Chinese Language (Chinese Language Direction)” within B.A. programs for foreign students; confirms 4-year degree and Chinese-taught route context. |
| S3 | [Chinese Language degree program description](https://admission.blcu.edu.cn/en/2023/1220/c1520a2687/page.htm) | Published 2023-12-20; “Training Program for International Bachelor's Degree Students Majoring in Chinese Language (2023),” §§I–III | Exact degree route; affiliated department and four years of study (generally). Older dated program description, corroborated with current S1/S2 listing. |
| S4 | [BLCU CSCA instructions](https://admission.blcu.edu.cn/en/2025/1212/c1587a3032/page.htm) | Published 2025-12-12; CSCA applicability, Chinese Language row, exemption rules | From Fall 2026 all international undergraduate applicants must submit CSCA; Chinese Language group subjects and HSK-based Chinese-test exemption are described. |
| S5 | [Beijing International Students Scholarship](https://admission.blcu.edu.cn/en/2023/1219/c1156a2681/page.htm) | Page shows 2023-12-19 publication; checked 2026-09-23; eligibility, coverage, process, application dates | Page includes cycle-specific September 2026 and March 2027 scholarship dates. These are scholarship dates, not admissions deadlines. Age reference remains September 1, 2026 even alongside March 2027 cycle. |
| S6 | [Ministry of Education nationality regulation cited by BLCU](https://www.moe.gov.cn/srcsite/A20/moe_850/202006/t20200609_464159.html) | Linked from S1; checked 2026-09-23 | MOE URL redirected in a loop in this check; details are summarized on S1 and are not separately verified here. |

## Admission field ledger

| fieldPath | Cycle and route | Value; status; unknown reason where applicable | Evidence / locator | Catalog proposal |
|---|---|---|---|---|
| identity.officialEnglishName | Current route | Chinese Language (Chinese Language Direction); verified (proposed) | S1, Programs for International Students Only; S2 major list | Keep “Chinese Language”; optionally retain the direction qualifier. |
| identity.officialChineseName | Current route | 汉语言（汉语言方向）; verified (proposed translation from BLCU Chinese admissions page) | BLCU Chinese page [admission.blcu.edu.cn/main.htm](https://admission.blcu.edu.cn/main.htm), undergraduate entry guide excerpt; dated cycle examples there are old | Keep separate from English title. |
| identity.thaiTranslation | Current route | ภาษาจีน (แนวทางภาษาจีน); translated label, not official English name | Translation of S1/S2 | Keep separate from university title. |
| location.city | Current | Beijing; verified | S1 footer/contact address, Haidian District, Beijing; S2 footer | Catalog city supported. |
| degree.level | Current | Bachelor of Arts (B.A.); verified | S2, heading “B.A. (For foreign students only, 4-year program)” | Catalog currently omits level; add only after reviewer. |
| route.identity | Current | International-student-only bachelor’s Chinese Language direction, Chinese-taught; verified | S1 international-only section; S2 B.A. route; S4 Chinese Language row lists teaching language Chinese | This is a degree route, not a non-degree Chinese course. |
| language.teaching | Current | Chinese; verified | S4 Chinese Language row, “Program for International Students (Separate Classes)” | Keep route as Chinese-language instruction. |
| duration | Current | 4 years; verified | S2 foreign-student B.A. major list; S3 §II says generally four years | Catalog omits duration; 4 years supported. |
| intake.pattern | Standing rule | Starred majors enroll in March and September; Chinese Language has `*`; verified as general published pattern | S1 Application Dates and starred Chinese Language row | Supports recurring month pattern only, not a dated 2027 application opening/deadline. |
| intake.2027.month | March 2027 | March is the requested/catalog target and fits the standing starred-major pattern; 2027-specific admission confirmation unknown / not_found_in_checked_sources | S1 standing rule; no separate 2027 admission notice/date found on checked pages | Do not present March 2027 as confirmed cycle-specific from a new notice. |
| application.openDate.2027 | March 2027 intake | null; unknown / not_found_in_checked_sources | S1 has no 2027 opening date | Leave blank. |
| application.deadline.2027 | March 2027 intake | null; unknown / not_found_in_checked_sources | S1 Applications Dates only gives March 2026; S5 gives Jan 12, 2027 for the scholarship only | Do not reuse scholarship deadline as admission deadline. |
| application.deadline.2026.march | March 2026 intake | 2026-01-12; verified as date stated on S1, Beijing timezone/cutoff time not stated | S1 Application Dates: March 2026 intake | Historical admission date only; not 2027. |
| application.deadline.2026.september | S1 says September 2025 intake | Conflict: text says “September 2025” with deadline June 30, 2026 | S1 Application Dates | Preserve contradiction; do not silently change 2025 to 2026. |
| eligibility.education | Current general bachelor entry | High school diploma or equivalent; verified | S1 Application Eligibility | No named IB/A-Level alternatives or equivalency details beyond “or equivalent.” |
| eligibility.gpa | Current | null; unknown / not_found_in_checked_sources | S1 does not state GPA or scale | Do not infer from academic excellence wording elsewhere. |
| eligibility.nationality | International route | Non-Chinese citizen holding an ordinary foreign passport; verified | S1 Application Eligibility | Thai citizens ordinarily fall within non-Chinese scope; nationality-specific Thai exception not stated. |
| eligibility.nationality.history | Applicants with Chinese-citizen parent(s) settled abroad / former PRC residents | Additional foreign-citizenship and residence-history conditions stated; verified as S1 text | S1 Application Eligibility, footnotes; MOE link S6 not independently retrieved | Apply to relevant histories; not a routine additional Thai rule. |
| eligibility.age | Current general page | Conflict: states age 18–55, but immediately allows applicants under 18 with school consent and guardianship notarial documents; reference date absent | S1 Application Eligibility | Do not project either a firm minimum or a maximum to 2027 without clarification. |
| eligibility.minors | Current general page | Under-18 path requires school consent and guardianship notarial certificate/relevant documents; verified, but conflicts with stated age floor | S1 Application Eligibility | Record both clauses; reviewer should resolve relationship. |
| language.hsk | Current route | HSK 4, total 180 or above; verified | S1 Chinese Language requirement under Programs for International Students Only | Catalog matches. Component subscores not specified. |
| language.hskValidity | Current | null; unknown / not_found_in_checked_sources | S1 no validity period/reference date | Leave unknown. |
| language.ielts | Current route | Not applicable to Chinese-taught Chinese Language route | S4 row labels teaching language Chinese and lists Chinese/Math CSCA subjects; S1 imposes HSK | No IELTS minimum found for this route. |
| language.alternativesExemptions | Current | No alternative HSK proof listed; unknown whether other waivers exist | S1 route entry requirement states HSK4/180; no waiver stated | Do not claim IELTS or other substitute. |
| csca.role | Fall 2026 onward; March 2027 target | Required for international bachelor applicants; verified as BLCU-wide rule effective from Fall 2026 | S1 eligibility note; S4 CSCA instructions | Catalog “required” is supported for Fall 2026 onward; 2027 minimum score not stated. |
| csca.subjects | Chinese Language | Chinese (Humanities Chinese) and Mathematics; HSK4 certificate holders may be exempt from Chinese test, Mathematics remains required; verified | S4, Chinese Language row and exemption note | Add subjects and conditional exemption; do not reduce to full exemption. |
| csca.examLanguage/date/score | March 2027 | Exact language, score minimum and exam deadline for this intake unknown / not_found_in_checked_sources | S4 gives general exam formats/dates, no route-specific 2027 minimum/deadline | Keep null pending cycle notice. |
| costs.tuition.2026/current | Annual | CNY 25,800/year; verified as current page-listed rate, cycle applicability not specified | S1 Programs for International Students Only table, Chinese Language row | Existing catalog amount matches; fee year “current page” is not a 2027 guarantee. |
| costs.tuition.2027 | 2027 | null; unknown / not_found_in_checked_sources | S1 has no 2027 rate | Do not carry forward 25,800 as a 2027 price. |
| costs.applicationFee | Current page | CNY 800 registration fee, online, non-refundable; verified | S1 Application Materials | Catalog does not state it. 2027 fee confirmation unknown. |
| costs.otherFees/bundles | 2027 | null; unknown / not_found_in_checked_sources | S1 lists no consolidated other-cost schedule for this cycle | Do not estimate insurance, housing or living costs. |
| documents.required | Current page | Passport information page; high-school diploma and all-semester transcript (notarized Chinese/English translation if needed); HSK certificate; recommendation letter in Chinese/English; guarantor credentials; non-criminal record; photo; major-specific documents; verified | S1 Application Materials | Catalog’s generic list is incomplete; update only after reviewer maps conditional cases. |
| documents.conditional | Applicants not yet graduated / under 18 | Expected-graduation letter and later diploma for prospective graduates; under-18 guardian/school consent documents; verified | S1 Application Materials and Eligibility | Keep conditional document requirements distinct. |
| application.channel | Current | BLCU International Student Application System, `http://apply.blcu.edu.cn`; online materials; verified | S1 Application Procedures | Catalog currently lacks URL. |
| application.selection | Current | BLCU reviews uploaded materials and sends results by email; verified | S1 Application Procedures | No interview requirement is stated for this Chinese Language route. |
| contact | Current | International Student Admissions and Affairs; Beijing address; phones +86-10-82303951/60303086/82303086; English email en@blcu.edu.cn; verified | S1 Contacts | Use official contact details. |

## Scholarship applicability (separate from admission)

Beijing International Students Scholarship is an undergraduate-capable, non-Chinese-citizen award. It is a separate committee selection and is not guaranteed by admission. The official page says it covers first-year tuition only and excludes other fees. It directs bachelor applicants to the same undergraduate entry requirements and asks freshmen to upload a separate scholarship form in the application system. This is scholarship eligibility/application information, not the B.A. admission requirement.

For March 2027 enrollment, S5 says submit the scholarship application before 2027-01-12 and results will be announced in February 2027. This date is the scholarship deadline, not the admission deadline; no exact cutoff time/timezone is stated on that page. The page’s bachelor age condition is “in principle” under 30 as of 2026-09-01, creating unclear applicability to a March 2027 intake. Exact scholarship award amount is bounded by route tuition but the 2027 tuition rate is unknown; renewal, quota, extra criteria and stacking restrictions are not established on S5.

## Conflicts, unknowns and proposed catalog changes

- S1 says March 2026 deadline January 12, then says “September 2025” deadline June 30, 2026. This appears inconsistent; no correction is inferred. S5 independently has a scholarship-only deadline for March 2027.
- S1 states ages 18–55 and then gives a process for under-18 applicants. Treat minimum-age applicability as conflict pending BLCU clarification.
- S1/S2/S3 support the route identity, Chinese instruction, 4-year B.A., HSK4/180 and current page tuition CNY 25,800/year. The latter is not cycle-labeled and does not establish a 2027 price.
- Proposed catalog edits: preserve HSK4/180 and listed current tuition with its non-cycle-specific caveat; confirm duration 4 years; add Chinese-taught route, CSCA Chinese+Math with HSK4 exemption only for Chinese component, and registration fee CNY 800. Leave 2027 admission opening/deadline and tuition unknown. Keep scholarship dates only in scholarship facts, never the admissions deadline. Retain both date and age conflicts for reviewer resolution.
