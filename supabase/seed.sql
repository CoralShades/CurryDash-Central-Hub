-- =============================================================================
-- CurryDash Central Hub — Seed Data
-- =============================================================================
-- NOTE: Do NOT insert rows into `users` here.
-- The `users` table has a FK to `auth.users(id)`, which requires a real
-- Supabase Auth account.  Create users via the Supabase Auth API or the
-- Supabase Dashboard, then let the `handle_new_user` trigger (if configured)
-- populate the `users` table automatically.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- Default roles
-- Using fixed UUIDs so downstream code / RLS policies can reference them by
-- a stable, predictable value without needing a lookup query.
-- ---------------------------------------------------------------------------
INSERT INTO roles (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin',       'System administrator with full access'),
  ('00000000-0000-0000-0000-000000000002', 'developer',   'Developer with access to code and project data'),
  ('00000000-0000-0000-0000-000000000003', 'qa',          'QA engineer with access to testing data'),
  ('00000000-0000-0000-0000-000000000004', 'stakeholder', 'Stakeholder with read-only aggregate access')
ON CONFLICT (name) DO NOTHING;


-- ---------------------------------------------------------------------------
-- Initial system_health records — one row per external integration.
-- Status starts as 'unconfigured' until the first successful webhook or sync.
-- ---------------------------------------------------------------------------
INSERT INTO system_health (source, status) VALUES
  ('jira',      'unconfigured'),
  ('github',    'unconfigured'),
  ('anthropic', 'unconfigured')
ON CONFLICT (source) DO NOTHING;
