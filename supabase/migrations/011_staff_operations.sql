-- Migration 011: Staff Operations Suite — Shift & Department Columns
-- ============================================================
-- Adds operational columns to public.users required by Sprint 10:
--   department  : Which hotel department the staff member belongs to
--   shift       : Their scheduled shift assignment
--   duty_status : Real-time on/off duty toggle (editable by manager)
-- These columns are nullable so existing rows are unaffected.
-- Live accounts that have not set these fields will show empty states.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS department  VARCHAR(50)  DEFAULT NULL
    CHECK (department IS NULL OR department IN ('management', 'front_desk', 'concierge', 'housekeeping', 'maintenance', 'fnb')),
  ADD COLUMN IF NOT EXISTS shift       VARCHAR(20)  DEFAULT NULL
    CHECK (shift IS NULL OR shift IN ('morning', 'afternoon', 'night', 'flexible')),
  ADD COLUMN IF NOT EXISTS duty_status VARCHAR(20)  DEFAULT NULL
    CHECK (duty_status IS NULL OR duty_status IN ('on_duty', 'off_duty', 'break'));

-- RLS: hotel_manager may update department/shift/duty_status for staff in their hotel.
-- The existing users_self_update policy already lets each user update their own row.
-- We add a manager policy so managers can update OTHER staff members' operational fields.
DROP POLICY IF EXISTS "hotel_manager_update_staff" ON public.users;
CREATE POLICY "hotel_manager_update_staff"
  ON public.users FOR UPDATE
  TO authenticated
  USING (
    hotel_id = get_user_hotel_id()
    AND get_user_role() IN ('hotel_manager', 'super_admin')
  )
  WITH CHECK (
    hotel_id = get_user_hotel_id()
    AND get_user_role() IN ('hotel_manager', 'super_admin')
  );
