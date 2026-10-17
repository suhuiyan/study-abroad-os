CREATE TABLE IF NOT EXISTS student_profile (
  user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS program (
  id text PRIMARY KEY, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS shortlist (
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  program_id text NOT NULL REFERENCES program(id), created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(user_id, program_id)
);
CREATE TABLE IF NOT EXISTS application (
  id uuid PRIMARY KEY, user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  program_id text NOT NULL REFERENCES program(id), data jsonb NOT NULL,
  version integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(user_id, program_id)
);
ALTER TABLE application ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1;
CREATE INDEX IF NOT EXISTS application_owner ON application(user_id);
CREATE TABLE IF NOT EXISTS admin_user (user_id text PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE);
CREATE TABLE IF NOT EXISTS program_revision (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, program_id text NOT NULL REFERENCES program(id),
  actor text NOT NULL, data jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS activity_event (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id text REFERENCES "user"(id) ON DELETE CASCADE,
  event text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS source_document (
  id text PRIMARY KEY, url text NOT NULL UNIQUE, university_ids text[] NOT NULL,
  status text NOT NULL DEFAULT 'pending', last_checked_at timestamptz,
  last_changed_at timestamptz, latest_hash text, content_type text,
  last_http_status integer, error text
);
CREATE TABLE IF NOT EXISTS source_version (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_id text NOT NULL REFERENCES source_document(id),
  sha256 text NOT NULL, fetched_at timestamptz NOT NULL DEFAULT now(),
  content_type text NOT NULL, body bytea NOT NULL,
  UNIQUE(source_id, sha256)
);
CREATE INDEX IF NOT EXISTS source_version_history ON source_version(source_id, fetched_at DESC);
CREATE TABLE IF NOT EXISTS source_check_run (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status text NOT NULL DEFAULT 'running' CHECK (status IN ('running','completed','failed')),
  started_at timestamptz NOT NULL DEFAULT now(), finished_at timestamptz,
  checked_count integer NOT NULL DEFAULT 0 CHECK (checked_count >= 0),
  changed_count integer NOT NULL DEFAULT 0 CHECK (changed_count >= 0),
  error_count integer NOT NULL DEFAULT 0 CHECK (error_count >= 0),
  error text
);
CREATE TABLE IF NOT EXISTS review_item (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  run_id bigint REFERENCES source_check_run(id),
  source_id text NOT NULL,
  source_hash text NOT NULL,
  program_id text NOT NULL REFERENCES program(id),
  base_revision bigint NOT NULL DEFAULT 0 CHECK (base_revision >= 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','draft','approved','rejected')),
  before_data jsonb NOT NULL,
  after_data jsonb,
  reviewer text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  FOREIGN KEY (source_id, source_hash) REFERENCES source_version(source_id, sha256),
  UNIQUE(source_id, source_hash, program_id)
);
CREATE INDEX IF NOT EXISTS review_item_queue ON review_item(status, created_at);
