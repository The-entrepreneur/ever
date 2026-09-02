-- Migration 007: Fix signup RLS policies
-- Problem: New self-serve users had no INSERT policy on hotels table
-- and no self-upsert policy on users, leaving hotel_id = NULL after signup

-- Allow authenticated users to INSERT a hotel during self-serve signup
CREATE POLICY "hotel_self_signup_insert"
  ON public.hotels FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow users to insert/update their own row in public.users
DROP POLICY IF EXISTS "users_self_upsert" ON public.users;
CREATE POLICY "users_self_upsert"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "users_self_update" ON public.users;
CREATE POLICY "users_self_update"
  ON public.users FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());
