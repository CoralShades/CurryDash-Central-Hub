-- =============================================================================
-- Fix public.users FK + Seed roles
--
-- The initial schema references auth.users(id) (Supabase GoTrue).
-- But we use Auth.js with @auth/supabase-adapter, which stores users in
-- next_auth.users instead. Drop the FK so we can link Auth.js user IDs
-- into public.users without needing a GoTrue record.
-- =============================================================================

-- Drop the FK constraint from public.users.id -> auth.users(id)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_pkey CASCADE;
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Seed the four CurryDash roles
INSERT INTO roles (name, description) VALUES
  ('admin',       'System administration, user management'),
  ('developer',   'Code development, technical tasks'),
  ('qa',          'Quality assurance, testing'),
  ('stakeholder', 'Project oversight, business metrics')
ON CONFLICT (name) DO NOTHING;
