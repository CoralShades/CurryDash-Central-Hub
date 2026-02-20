-- =============================================================================
-- CurryDash Central Hub — E2E Test User Seed
--
-- Creates 4 deterministic test users with fixed UUIDs for Playwright E2E tests.
-- The on_next_auth_user_created trigger auto-creates public.users records with
-- default role 'developer'. We then update to the correct role for each user.
--
-- Run: npx supabase db execute --file supabase/test-seed.sql
-- Or:  psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/test-seed.sql
-- =============================================================================

-- Insert test users into next_auth.users (trigger fires → creates public.users)
INSERT INTO next_auth.users (id, name, email, image) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Test Admin',       'admin@test.currydash.local',  NULL),
  ('22222222-2222-2222-2222-222222222222', 'Test Developer',   'dev@test.currydash.local',    NULL),
  ('33333333-3333-3333-3333-333333333333', 'Test QA',          'qa@test.currydash.local',     NULL),
  ('44444444-4444-4444-4444-444444444444', 'Test Stakeholder', 'stake@test.currydash.local',  NULL)
ON CONFLICT (id) DO NOTHING;

-- Set correct roles using subqueries (roles.id is gen_random_uuid, not fixed)
-- Developer stays as-is (trigger default)

UPDATE public.users
SET role_id = (SELECT id FROM public.roles WHERE name = 'admin')
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE public.users
SET role_id = (SELECT id FROM public.roles WHERE name = 'qa')
WHERE id = '33333333-3333-3333-3333-333333333333';

UPDATE public.users
SET role_id = (SELECT id FROM public.roles WHERE name = 'stakeholder')
WHERE id = '44444444-4444-4444-4444-444444444444';
