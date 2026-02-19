-- GitHub CI/CD tables for story 5.4: CI/CD Status & Commit Activity Widget
-- Stores workflow run events received via GitHub Actions webhook (workflow_run events)
-- and daily aggregated commit activity per repository.

-- github_workflow_runs
CREATE TABLE github_workflow_runs (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id            BIGINT       NOT NULL,
  github_repo_id    UUID         NOT NULL REFERENCES github_repos(id) ON DELETE CASCADE,
  workflow_name     TEXT         NOT NULL,
  workflow_id       BIGINT,
  head_branch       TEXT,
  head_sha          TEXT,
  event             TEXT,                              -- 'push', 'pull_request', etc.
  status            TEXT         NOT NULL,             -- 'queued', 'in_progress', 'completed'
  conclusion        TEXT,                              -- 'success', 'failure', 'cancelled', null
  html_url          TEXT,
  run_number        INTEGER,
  duration_seconds  INTEGER,
  raw_payload       JSONB        NOT NULL DEFAULT '{}',
  github_created_at TIMESTAMPTZ,
  github_updated_at TIMESTAMPTZ,
  synced_at         TIMESTAMPTZ,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (github_repo_id, run_id)
);

ALTER TABLE github_workflow_runs ENABLE ROW LEVEL SECURITY;

-- github_commit_activity: daily aggregated commit counts per repo
CREATE TABLE github_commit_activity (
  id              UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  github_repo_id  UUID   NOT NULL REFERENCES github_repos(id) ON DELETE CASCADE,
  commit_date     DATE   NOT NULL,
  commit_count    INTEGER NOT NULL DEFAULT 0,
  author_count    INTEGER          DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (github_repo_id, commit_date)
);

ALTER TABLE github_commit_activity ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX idx_github_workflow_runs_repo_created
  ON github_workflow_runs (github_repo_id, github_created_at DESC);

CREATE INDEX idx_github_workflow_runs_workflow_name
  ON github_workflow_runs (github_repo_id, workflow_name, run_number DESC);

CREATE INDEX idx_github_commit_activity_repo_date
  ON github_commit_activity (github_repo_id, commit_date DESC);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_github_workflow_runs_updated_at
  BEFORE UPDATE ON github_workflow_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_commit_activity_updated_at
  BEFORE UPDATE ON github_commit_activity
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS policies: authenticated users can read; service role bypasses RLS for writes
CREATE POLICY "Authenticated users can read workflow runs"
  ON github_workflow_runs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read commit activity"
  ON github_commit_activity FOR SELECT
  TO authenticated
  USING (true);
