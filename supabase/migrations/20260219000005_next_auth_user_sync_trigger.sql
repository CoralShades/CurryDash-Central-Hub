-- =============================================================================
-- Sync trigger: next_auth.users → public.users
--
-- When @auth/supabase-adapter INSERTs a user into next_auth.users (on OAuth
-- sign-in), this trigger auto-creates a corresponding public.users record
-- with default role = 'developer' (least-privilege functional role).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.sync_next_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_role_id UUID;
BEGIN
  SELECT id INTO default_role_id FROM public.roles WHERE name = 'developer';

  INSERT INTO public.users (id, email, full_name, avatar_url, role_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NEW.name,
    NEW.image,
    default_role_id
  )
  ON CONFLICT (id) DO UPDATE SET
    email      = COALESCE(EXCLUDED.email, public.users.email),
    full_name  = COALESCE(EXCLUDED.full_name, public.users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.users.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Fire after INSERT on next_auth.users
CREATE TRIGGER on_next_auth_user_created
  AFTER INSERT ON next_auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_next_auth_user();
