# Data Strategy

## Sources
Prefer official sources in this order:
1. University official pages/docs
2. Scholarship provider/government sources
3. Official visa/government sources
4. Trusted institutional partners
5. Secondary aggregators only as discovery aids, not final authority

## Pipeline
Official Source -> Raw Capture -> AI Extraction -> Normalization -> Validation -> Human/Admin Review (when required) -> Published Structured Data -> Search/Eligibility/AI.

## Data principles
- Store provenance.
- Store retrieval/check timestamps.
- Preserve source text or source snapshots where legally/technically appropriate.
- Version critical fields.
- Detect stale records.
- Never silently overwrite critical historical values without versioning.

## Critical fields requiring strong sourcing
- application deadline
- eligibility rules
- tuition
- scholarship benefits
- visa requirements
- housing verification claims
