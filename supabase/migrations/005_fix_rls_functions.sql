-- Revert RLS Functions back to using JWT claims for maximum performance and security
-- The trigger handles injecting hotel_id into the JWT metadata.

CREATE OR REPLACE FUNCTION public.get_user_hotel_id()
RETURNS uuid AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'hotel_id')::uuid,
    (auth.jwt() -> 'app_metadata' ->> 'hotel_id')::uuid,
    NULL
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    (auth.jwt() -> 'app_metadata' ->> 'role')::text,
    'hotel_readonly'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
