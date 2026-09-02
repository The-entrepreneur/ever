-- Migration 009: Sync App Metadata & Solidify RLS
-- ============================================================
-- OWASP ASVS & Supabase Security standard:
-- Ensure hotel_id and role are securely synchronized into auth.users.raw_app_meta_data
-- so JWT tokens and public.users queries always agree, and RLS policies never fail.

UPDATE auth.users au
SET raw_app_meta_data = COALESCE(au.raw_app_meta_data, '{}'::jsonb) || 
  jsonb_build_object('hotel_id', pu.hotel_id, 'role', pu.role::text)
FROM public.users pu
WHERE au.id = pu.id;

CREATE OR REPLACE FUNCTION public.sync_user_app_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('hotel_id', NEW.hotel_id, 'role', NEW.role::text)
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_user_app_metadata ON public.users;
CREATE TRIGGER tr_sync_user_app_metadata
AFTER INSERT OR UPDATE OF hotel_id, role ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.sync_user_app_metadata();

CREATE OR REPLACE FUNCTION public.get_user_hotel_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT hotel_id FROM public.users WHERE id = auth.uid() LIMIT 1),
    (auth.jwt() -> 'app_metadata' ->> 'hotel_id')::uuid,
    (auth.jwt() -> 'user_metadata' ->> 'hotel_id')::uuid,
    NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role::text FROM public.users WHERE id = auth.uid() LIMIT 1),
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'hotel_readonly'
  );
$$;
