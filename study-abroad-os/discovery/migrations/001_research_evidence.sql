-- Additive S5-A schema. Existing discovery tables are intentionally untouched.
CREATE TABLE research_schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE research_packages (
    package_id TEXT PRIMARY KEY,
    moe_code TEXT NOT NULL REFERENCES universities(moe_code),
    schema_version INTEGER NOT NULL,
    input_version TEXT NOT NULL,
    dataset_source_sha256 TEXT NOT NULL,
    run_id TEXT NOT NULL,
    as_of TEXT NOT NULL,
    run_state TEXT NOT NULL,
    created_at TEXT NOT NULL,
    source_dataset_id TEXT REFERENCES datasets(dataset_id),
    input_row_snapshot_json TEXT NOT NULL CHECK (json_valid(input_row_snapshot_json)),
    package_sha256 TEXT NOT NULL,
    contract_payload TEXT NOT NULL CHECK (json_valid(contract_payload)),
    UNIQUE (package_id, package_sha256)
);

CREATE TABLE research_scopes (
    package_id TEXT NOT NULL REFERENCES research_packages(package_id),
    scope_id TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('institution','admission','program','scholarship')),
    label TEXT NOT NULL,
    cycle TEXT,
    degree_level TEXT,
    applicant_channel TEXT,
    program_scope TEXT,
    PRIMARY KEY (package_id, scope_id)
);

CREATE TABLE source_records (
    source_id TEXT PRIMARY KEY,
    canonical_url TEXT NOT NULL UNIQUE,
    publisher TEXT,
    officiality TEXT NOT NULL CHECK (officiality IN ('confirmed','unconfirmed')),
    first_seen_at TEXT NOT NULL
);

CREATE TABLE source_versions (
    source_version_id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES source_records(source_id),
    final_url TEXT,
    title TEXT,
    published_at TEXT,
    fetched_at TEXT NOT NULL,
    http_status INTEGER,
    retrieval_method TEXT NOT NULL CHECK (retrieval_method IN ('html','pdf_text','ocr','browser','search_snippet')),
    capture_path TEXT,
    sha256 TEXT,
    error TEXT
);

CREATE TABLE evidence (
    package_id TEXT NOT NULL REFERENCES research_packages(package_id),
    evidence_id TEXT NOT NULL,
    source_version_id TEXT NOT NULL REFERENCES source_versions(source_version_id),
    original_excerpt TEXT NOT NULL,
    locator TEXT NOT NULL,
    language TEXT NOT NULL,
    PRIMARY KEY (package_id, evidence_id)
);

CREATE TABLE source_ownership_evidence (
    source_id TEXT NOT NULL REFERENCES source_records(source_id),
    package_id TEXT NOT NULL,
    evidence_id TEXT NOT NULL,
    PRIMARY KEY (source_id, package_id, evidence_id),
    FOREIGN KEY (package_id, evidence_id) REFERENCES evidence(package_id, evidence_id)
);

CREATE TABLE research_search_events (
    search_event_id TEXT PRIMARY KEY,
    package_id TEXT NOT NULL REFERENCES research_packages(package_id),
    query_text TEXT NOT NULL,
    queried_at TEXT NOT NULL,
    target_domain TEXT,
    action TEXT NOT NULL,
    result TEXT NOT NULL,
    source_id TEXT REFERENCES source_records(source_id)
);

CREATE TABLE claims (
    claim_id TEXT PRIMARY KEY,
    package_id TEXT NOT NULL,
    scope_id TEXT NOT NULL,
    field TEXT NOT NULL,
    value_json TEXT CHECK (value_json IS NULL OR json_valid(value_json)),
    unit TEXT,
    state TEXT NOT NULL CHECK (state IN ('supported','unknown','conflicting')),
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (package_id, scope_id) REFERENCES research_scopes(package_id, scope_id),
    UNIQUE (claim_id, package_id)
);

CREATE TABLE claim_evidence (
    claim_id TEXT NOT NULL,
    package_id TEXT NOT NULL,
    evidence_id TEXT NOT NULL,
    PRIMARY KEY (claim_id, evidence_id),
    FOREIGN KEY (claim_id, package_id) REFERENCES claims(claim_id, package_id),
    FOREIGN KEY (package_id, evidence_id) REFERENCES evidence(package_id, evidence_id)
);

CREATE TABLE review_decisions (
    review_decision_id TEXT PRIMARY KEY,
    package_id TEXT NOT NULL REFERENCES research_packages(package_id),
    package_sha256 TEXT NOT NULL,
    reviewer TEXT NOT NULL,
    review_type TEXT NOT NULL CHECK (review_type IN ('independent','self','human')),
    decision TEXT NOT NULL CHECK (decision IN ('accepted','changes_required','rejected')),
    reviewed_at TEXT NOT NULL,
    cycle TEXT,
    claim_decisions_json TEXT NOT NULL CHECK (json_valid(claim_decisions_json)),
    evidence_references_json TEXT NOT NULL CHECK (json_valid(evidence_references_json)),
    unresolved_json TEXT NOT NULL CHECK (json_valid(unresolved_json)),
    FOREIGN KEY (package_id, package_sha256) REFERENCES research_packages(package_id, package_sha256),
    UNIQUE (review_decision_id, package_id, package_sha256)
);

CREATE TABLE import_events (
    import_event_id TEXT PRIMARY KEY,
    idempotency_key TEXT NOT NULL UNIQUE,
    package_id TEXT NOT NULL,
    package_sha256 TEXT NOT NULL,
    review_decision_id TEXT NOT NULL,
    applied_patch_json TEXT NOT NULL CHECK (json_valid(applied_patch_json)),
    backup_reference TEXT NOT NULL,
    backup_sha256 TEXT NOT NULL,
    imported_at TEXT NOT NULL,
    before_hash TEXT NOT NULL,
    after_hash TEXT NOT NULL,
    FOREIGN KEY (package_id, package_sha256) REFERENCES research_packages(package_id, package_sha256),
    FOREIGN KEY (review_decision_id, package_id, package_sha256)
        REFERENCES review_decisions(review_decision_id, package_id, package_sha256)
);

CREATE INDEX idx_research_packages_moe_asof ON research_packages(moe_code, as_of);
CREATE INDEX idx_research_scopes_kind_cycle_degree ON research_scopes(kind, cycle, degree_level);
CREATE INDEX idx_claims_state ON claims(state);
CREATE INDEX idx_source_records_url ON source_records(canonical_url);
CREATE INDEX idx_source_versions_source_hash ON source_versions(source_id, sha256);
CREATE INDEX idx_review_decisions_decision ON review_decisions(decision);
CREATE INDEX idx_import_events_package ON import_events(package_id, imported_at);

INSERT INTO research_schema_migrations(version, name)
VALUES (1, '001_research_evidence');
