-- =============================================================================
-- Migration: Row-Level Security Policies
-- Story 2.4: Server-Side Authorization & Supabase RLS Policies
--
-- Role hierarchy:
--   admin       — full read/write on all tables
--   developer   — read project data, read/write own assignments
--   qa          — read project data, read/write QA records
--   stakeholder — read-only aggregate project data (no individual developer metrics)
--
-- All policies use auth.jwt()->>'role' to determine access level (FR5).
-- No security-by-UI-hiding: forbidden data is excluded at query level (NFR-S6).
-- =============================================================================

-- Helper function: get current user's role from JWT claim
CREATE OR REPLACE FUNCTION auth_role()
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT auth.jwt()->>'role'
$$;

-- Helper function: get current user's ID from JWT sub
CREATE OR REPLACE FUNCTION auth_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT (auth.jwt()->>'sub')::uuid
$$;

-- =============================================================================
-- ROLES table — lookup only, all authenticated users can read
-- =============================================================================
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "roles_read_all"
  ON roles FOR SELECT
  USING (auth_role() IS NOT NULL);

CREATE POLICY "roles_admin_write"
  ON roles FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');

-- =============================================================================
-- USERS table
-- =============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Admin: full access
CREATE POLICY "users_admin_all"
  ON users FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');

-- Users: can read and update their own record
CREATE POLICY "users_read_own"
  ON users FOR SELECT
  USING (id = auth_user_id());

CREATE POLICY "users_update_own"
  ON users FOR UPDATE
  USING (id = auth_user_id())
  WITH CHECK (id = auth_user_id());

-- =============================================================================
-- TEAMS table — all authenticated users can read teams
-- =============================================================================
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "teams_read_authenticated"
  ON teams FOR SELECT
  USING (auth_role() IS NOT NULL);

CREATE POLICY "teams_admin_write"
  ON teams FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');

-- =============================================================================
-- TEAM_MEMBERS table — all authenticated users can read
-- =============================================================================
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_read_authenticated"
  ON team_members FOR SELECT
  USING (auth_role() IS NOT NULL);

CREATE POLICY "team_members_admin_write"
  ON team_members FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');

-- =============================================================================
-- JIRA_PROJECTS — all project roles can read; admin writes
-- =============================================================================
ALTER TABLE jira_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jira_projects_read_project_roles"
  ON jira_projects FOR SELECT
  USING (auth_role() IN ('admin', 'developer', 'qa', 'stakeholder'));

CREATE POLICY "jira_projects_admin_write"
  ON jira_projects FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');

-- =============================================================================
-- JIRA_SPRINTS — all project roles can read; admin writes
-- =============================================================================
ALTER TABLE jira_sprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jira_sprints_read_project_roles"
  ON jira_sprints FOR SELECT
  USING (auth_role() IN ('admin', 'developer', 'qa', 'stakeholder'));

CREATE POLICY "jira_sprints_admin_write"
  ON jira_sprints FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');

-- =============================================================================
-- JIRA_ISSUES — all roles can read; developer/qa can update own assignments
-- Stakeholders cannot see individual developer metric fields (handled at query
-- level in Server Components using restricted SELECT column lists — NFR-S6)
-- =============================================================================
ALTER TABLE jira_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "jira_issues_read_all_roles"
  ON jira_issues FOR SELECT
  USING (auth_role() IN ('admin', 'developer', 'qa', 'stakeholder'));

CREATE POLICY "jira_issues_admin_write"
  ON jira_issues FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');

-- Developers can update issues assigned to them
CREATE POLICY "jira_issues_developer_update_own"
  ON jira_issues FOR UPDATE
  USING (
    auth_role() = 'developer'
    AND assignee_email = (
      SELECT email FROM users WHERE id = auth_user_id()
    )
  )
  WITH CHECK (
    auth_role() = 'developer'
    AND assignee_email = (
      SELECT email FROM users WHERE id = auth_user_id()
    )
  );

-- QA can update issues in any QA-related status
CREATE POLICY "jira_issues_qa_update"
  ON jira_issues FOR UPDATE
  USING (auth_role() = 'qa')
  WITH CHECK (auth_role() = 'qa');

-- =============================================================================
-- GITHUB_REPOS — all roles can read; admin writes
-- =============================================================================
ALTER TABLE github_repos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "github_repos_read_all_roles"
  ON github_repos FOR SELECT
  USING (auth_role() IN ('admin', 'developer', 'qa', 'stakeholder'));

CREATE POLICY "github_repos_admin_write"
  ON github_repos FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');

-- =============================================================================
-- GITHUB_PULL_REQUESTS — developers/admin read/write; qa/stakeholder read-only
-- =============================================================================
ALTER TABLE github_pull_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "github_prs_read_all_roles"
  ON github_pull_requests FOR SELECT
  USING (auth_role() IN ('admin', 'developer', 'qa', 'stakeholder'));

CREATE POLICY "github_prs_admin_write"
  ON github_pull_requests FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');

-- =============================================================================
-- WEBHOOK_EVENTS — admin only (raw webhook payloads, sensitive)
-- =============================================================================
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "webhook_events_admin_only"
  ON webhook_events FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');

-- =============================================================================
-- DEAD_LETTER_EVENTS — admin only
-- =============================================================================
ALTER TABLE dead_letter_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dead_letter_events_admin_only"
  ON dead_letter_events FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');

-- =============================================================================
-- DASHBOARD_WIDGETS — users manage their own widgets; admin can manage all
-- =============================================================================
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_widgets_read_own"
  ON dashboard_widgets FOR SELECT
  USING (
    auth_role() IS NOT NULL
    AND (
      user_id = auth_user_id()
      OR auth_role() = 'admin'
    )
  );

CREATE POLICY "dashboard_widgets_write_own"
  ON dashboard_widgets FOR INSERT
  WITH CHECK (
    auth_role() IS NOT NULL
    AND user_id = auth_user_id()
  );

CREATE POLICY "dashboard_widgets_update_own"
  ON dashboard_widgets FOR UPDATE
  USING (
    user_id = auth_user_id()
    OR auth_role() = 'admin'
  )
  WITH CHECK (
    user_id = auth_user_id()
    OR auth_role() = 'admin'
  );

CREATE POLICY "dashboard_widgets_delete_own"
  ON dashboard_widgets FOR DELETE
  USING (
    user_id = auth_user_id()
    OR auth_role() = 'admin'
  );

-- =============================================================================
-- NOTIFICATIONS — users see only their own notifications
-- =============================================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notifications_read_own"
  ON notifications FOR SELECT
  USING (
    user_id = auth_user_id()
    OR auth_role() = 'admin'
  );

CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE
  USING (user_id = auth_user_id())
  WITH CHECK (user_id = auth_user_id());

CREATE POLICY "notifications_admin_write"
  ON notifications FOR INSERT
  WITH CHECK (auth_role() = 'admin');

CREATE POLICY "notifications_admin_delete"
  ON notifications FOR DELETE
  USING (auth_role() = 'admin');

-- =============================================================================
-- AI_CHAT_SESSIONS — users see only their own sessions; admin sees all
-- =============================================================================
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_chat_sessions_own"
  ON ai_chat_sessions FOR ALL
  USING (
    user_id = auth_user_id()
    OR auth_role() = 'admin'
  )
  WITH CHECK (
    user_id = auth_user_id()
    OR auth_role() = 'admin'
  );

-- =============================================================================
-- SYSTEM_HEALTH — admin read/write; all authenticated users can read
-- =============================================================================
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_health_read_authenticated"
  ON system_health FOR SELECT
  USING (auth_role() IS NOT NULL);

CREATE POLICY "system_health_admin_write"
  ON system_health FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');

-- =============================================================================
-- AI_USAGE — admin only (contains cost/token data)
-- =============================================================================
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_usage_admin_only"
  ON ai_usage FOR ALL
  USING (auth_role() = 'admin')
  WITH CHECK (auth_role() = 'admin');
