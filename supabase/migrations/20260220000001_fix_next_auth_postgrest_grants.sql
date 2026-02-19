-- =============================================================================
-- Fix PostgREST access to next_auth schema
-- PostgREST connects as 'authenticator' role, then switches to service_role
-- for service-key requests. The authenticator role needs USAGE to route
-- requests to the schema via Accept-Profile / Content-Profile headers.
-- =============================================================================

GRANT USAGE ON SCHEMA next_auth TO authenticator;
GRANT ALL ON ALL TABLES IN SCHEMA next_auth TO authenticator;
GRANT ALL ON ALL SEQUENCES IN SCHEMA next_auth TO authenticator;

-- Ensure future tables/sequences in next_auth are also accessible
ALTER DEFAULT PRIVILEGES IN SCHEMA next_auth
  GRANT ALL ON TABLES TO authenticator;
ALTER DEFAULT PRIVILEGES IN SCHEMA next_auth
  GRANT ALL ON SEQUENCES TO authenticator;

-- Force PostgREST to reload its schema cache
NOTIFY pgrst, 'reload schema';
