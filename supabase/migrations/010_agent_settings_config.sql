-- Migration 010: Agent Settings Config & Hotel Manager Update Policy
-- ============================================================
-- Enables storing full Agent Settings (tone, operational hours, HSM templates,
-- privacy URL, handoff triggers, etc.) in hotels.config JSONB.
-- Grants hotel_manager role UPDATE permission on their own hotel record.

ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

DROP POLICY IF EXISTS "hotel_manager_update" ON public.hotels;
CREATE POLICY "hotel_manager_update"
  ON public.hotels FOR UPDATE
  TO authenticated
  USING (id = get_user_hotel_id() AND get_user_role() IN ('hotel_manager', 'super_admin'))
  WITH CHECK (id = get_user_hotel_id() AND get_user_role() IN ('hotel_manager', 'super_admin'));
