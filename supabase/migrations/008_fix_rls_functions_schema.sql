-- Migration 008: Core RLS Fix + Schema Extensions
-- ============================================================
-- CRITICAL FIX: get_user_hotel_id() was reading from the JWT which
-- does NOT contain hotel_id for real self-serve signups. 
-- This caused ALL RLS policies to silently block every authenticated user
-- operation (faqs, rooms, upsells, etc.) with "violates RLS policy" errors.
-- Solution: read from public.users directly (always authoritative).

CREATE OR REPLACE FUNCTION public.get_user_hotel_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT hotel_id
  FROM public.users
  WHERE id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1),
    'hotel_readonly'
  );
$$;

-- Add missing profile columns to public.users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS mobile_number VARCHAR(50),
  ADD COLUMN IF NOT EXISTS business_address TEXT,
  ADD COLUMN IF NOT EXISTS property_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS pms VARCHAR(100);

-- Add setup and branding columns to hotels
ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS setup_complete BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS timezone VARCHAR(100),
  ADD COLUMN IF NOT EXISTS currency VARCHAR(10),
  ADD COLUMN IF NOT EXISTS primary_color VARCHAR(20);

-- Backfill user profile data from auth.users user_metadata
UPDATE public.users u
SET
  mobile_number = COALESCE(u.mobile_number, (au.raw_user_meta_data->>'mobile_number')),
  property_type = COALESCE(u.property_type, (au.raw_user_meta_data->>'property_type')),
  full_name     = COALESCE(u.full_name, (au.raw_user_meta_data->>'full_name'))
FROM auth.users au
WHERE u.id = au.id;
