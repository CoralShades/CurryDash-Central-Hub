-- =============================================================================
-- CurryDash Central Hub — Initial Schema Migration
-- Created: 2026-02-18
-- =============================================================================

-- ---------------------------------------------------------------------------
-- updated_at trigger function (must exist before any table uses it)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';


-- =============================================================================
-- TABLES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- roles
-- ---------------------------------------------------------------------------
CREATE TABLE roles (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL UNIQUE,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id     UUID        REFERENCES roles(id),
  email       TEXT        NOT NULL,
  full_name   TEXT,
  avatar_url  TEXT,
  metadata    JSONB       DEFAULT '{}',
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- teams
-- ---------------------------------------------------------------------------
CREATE TABLE teams (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- team_members
-- ---------------------------------------------------------------------------
CREATE TABLE team_members (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID        NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- jira_projects
-- ---------------------------------------------------------------------------
CREATE TABLE jira_projects (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_key TEXT        NOT NULL UNIQUE,
  name        TEXT        NOT NULL,
  description TEXT,
  raw_payload JSONB       DEFAULT '{}',
  synced_at   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE jira_projects ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- jira_sprints
-- ---------------------------------------------------------------------------
CREATE TABLE jira_sprints (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  jira_project_id  UUID        NOT NULL REFERENCES jira_projects(id) ON DELETE CASCADE,
  sprint_id        TEXT        NOT NULL UNIQUE,
  name             TEXT        NOT NULL,
  state            TEXT        NOT NULL DEFAULT 'active',
  start_date       TIMESTAMPTZ,
  end_date         TIMESTAMPTZ,
  raw_payload      JSONB       DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE jira_sprints ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- jira_issues
-- ---------------------------------------------------------------------------
CREATE TABLE jira_issues (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  jira_project_id  UUID        NOT NULL REFERENCES jira_projects(id) ON DELETE CASCADE,
  jira_sprint_id   UUID        REFERENCES jira_sprints(id) ON DELETE SET NULL,
  issue_key        TEXT        NOT NULL UNIQUE,
  summary          TEXT        NOT NULL,
  status           TEXT        NOT NULL DEFAULT 'To Do',
  priority         TEXT,
  assignee_email   TEXT,
  issue_type       TEXT,
  raw_payload      JSONB       DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE jira_issues ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- github_repos
-- ---------------------------------------------------------------------------
CREATE TABLE github_repos (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name      TEXT        NOT NULL UNIQUE,
  name           TEXT        NOT NULL,
  description    TEXT,
  default_branch TEXT        NOT NULL DEFAULT 'main',
  raw_payload    JSONB       DEFAULT '{}',
  synced_at      TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE github_repos ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- github_pull_requests
-- ---------------------------------------------------------------------------
CREATE TABLE github_pull_requests (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  github_repo_id UUID        NOT NULL REFERENCES github_repos(id) ON DELETE CASCADE,
  pr_number      INTEGER     NOT NULL,
  title          TEXT        NOT NULL,
  state          TEXT        NOT NULL DEFAULT 'open',
  author         TEXT,
  head_branch    TEXT,
  base_branch    TEXT,
  raw_payload    JSONB       DEFAULT '{}',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(github_repo_id, pr_number)
);
ALTER TABLE github_pull_requests ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- webhook_events  (deduplication table — event_id must be unique)
-- ---------------------------------------------------------------------------
CREATE TABLE webhook_events (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     TEXT        NOT NULL UNIQUE,
  source       TEXT        NOT NULL,
  event_type   TEXT        NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- dead_letter_events  (failed webhook payloads for manual retry / inspection)
-- ---------------------------------------------------------------------------
CREATE TABLE dead_letter_events (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source         TEXT        NOT NULL,
  event_type     TEXT,
  raw_payload    JSONB,
  error          TEXT        NOT NULL,
  correlation_id TEXT,
  retry_count    INTEGER     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE dead_letter_events ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- dashboard_widgets
-- ---------------------------------------------------------------------------
CREATE TABLE dashboard_widgets (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL,
  widget_config   JSONB       NOT NULL DEFAULT '{}',
  position        INTEGER     NOT NULL DEFAULT 0,
  is_ai_generated BOOLEAN     NOT NULL DEFAULT FALSE,
  is_visible      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  type       TEXT        NOT NULL DEFAULT 'info',
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  metadata   JSONB       DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- ai_chat_sessions
-- ---------------------------------------------------------------------------
CREATE TABLE ai_chat_sessions (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  messages    JSONB       NOT NULL DEFAULT '[]',
  token_count INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- system_health  (one row per external integration, upserted by webhooks/cron)
-- ---------------------------------------------------------------------------
CREATE TABLE system_health (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  source        TEXT        NOT NULL UNIQUE,
  status        TEXT        NOT NULL DEFAULT 'unknown',
  last_event_at TIMESTAMPTZ,
  metadata      JSONB       DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- ai_usage  (daily aggregated token / cost tracking per model)
-- ---------------------------------------------------------------------------
CREATE TABLE ai_usage (
  id          UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  date        DATE           NOT NULL,
  model       TEXT           NOT NULL,
  query_count INTEGER        NOT NULL DEFAULT 0,
  token_count INTEGER        NOT NULL DEFAULT 0,
  cost_usd    NUMERIC(10, 6) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  UNIQUE(date, model)
);
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;


-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX idx_jira_issues_status         ON jira_issues(status);
CREATE INDEX idx_jira_issues_project        ON jira_issues(jira_project_id);
CREATE INDEX idx_jira_issues_sprint         ON jira_issues(jira_sprint_id);
CREATE INDEX idx_webhook_events_event_id    ON webhook_events(event_id);
CREATE INDEX idx_dead_letter_events_source  ON dead_letter_events(source, created_at DESC);
CREATE INDEX idx_notifications_user_id      ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_dashboard_widgets_user_id  ON dashboard_widgets(user_id, role);
CREATE INDEX idx_ai_usage_date              ON ai_usage(date DESC);
CREATE INDEX idx_github_pull_requests_repo  ON github_pull_requests(github_repo_id, state);
CREATE INDEX idx_ai_chat_sessions_user      ON ai_chat_sessions(user_id, created_at DESC);


-- =============================================================================
-- updated_at TRIGGERS
-- =============================================================================

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jira_projects_updated_at
  BEFORE UPDATE ON jira_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jira_sprints_updated_at
  BEFORE UPDATE ON jira_sprints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jira_issues_updated_at
  BEFORE UPDATE ON jira_issues
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_repos_updated_at
  BEFORE UPDATE ON github_repos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_github_pull_requests_updated_at
  BEFORE UPDATE ON github_pull_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at
  BEFORE UPDATE ON dashboard_widgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_chat_sessions_updated_at
  BEFORE UPDATE ON ai_chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_health_updated_at
  BEFORE UPDATE ON system_health
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
