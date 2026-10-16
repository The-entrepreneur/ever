-- ===================================================================
-- EVER Platform — Cumulative Migration Runner
-- Applies migrations 010, 011, 012 to the live Supabase cloud project.
-- Project: https://oieidnsppwooknzofzeq.supabase.co
-- ===================================================================

-- ─────────────────────────────────────────────────────────────────
-- MIGRATION 010: Agent Settings Config Column & Manager RLS Policy
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.hotels
  ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}'::jsonb;

DROP POLICY IF EXISTS "hotel_manager_update" ON public.hotels;
CREATE POLICY "hotel_manager_update"
  ON public.hotels FOR UPDATE
  TO authenticated
  USING (id = get_user_hotel_id() AND get_user_role() IN ('hotel_manager', 'super_admin'))
  WITH CHECK (id = get_user_hotel_id() AND get_user_role() IN ('hotel_manager', 'super_admin'));

-- ─────────────────────────────────────────────────────────────────
-- MIGRATION 011: Staff Operations Suite — Shift & Department Columns
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS department  VARCHAR(50)  DEFAULT NULL
    CHECK (department IS NULL OR department IN ('management', 'front_desk', 'concierge', 'housekeeping', 'maintenance', 'fnb')),
  ADD COLUMN IF NOT EXISTS shift       VARCHAR(20)  DEFAULT NULL
    CHECK (shift IS NULL OR shift IN ('morning', 'afternoon', 'night', 'flexible')),
  ADD COLUMN IF NOT EXISTS duty_status VARCHAR(20)  DEFAULT NULL
    CHECK (duty_status IS NULL OR duty_status IN ('on_duty', 'off_duty', 'break'));

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

-- ─────────────────────────────────────────────────────────────────
-- MIGRATION 012: Support & Engineering Tickets Suite
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    creator_name VARCHAR(255),
    creator_email VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General Inquiry',
    priority VARCHAR(50) NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),
    status VARCHAR(50) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    assigned_to VARCHAR(100) DEFAULT 'Ever Engineering & Operations Desk',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    sender_role VARCHAR(50) NOT NULL DEFAULT 'hotel_staff' CHECK (sender_role IN ('hotel_staff', 'ever_engineering', 'ever_admin')),
    sender_name VARCHAR(255) NOT NULL,
    sender_email VARCHAR(255),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_support_tickets_hotel_id ON public.support_tickets(hotel_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Policies for support_tickets
DROP POLICY IF EXISTS "hotel_staff_view_tickets" ON public.support_tickets;
CREATE POLICY "hotel_staff_view_tickets" ON public.support_tickets
    FOR SELECT TO authenticated
    USING (hotel_id = get_user_hotel_id() OR get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "hotel_staff_insert_tickets" ON public.support_tickets;
CREATE POLICY "hotel_staff_insert_tickets" ON public.support_tickets
    FOR INSERT TO authenticated
    WITH CHECK (hotel_id = get_user_hotel_id() OR get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "hotel_staff_update_tickets" ON public.support_tickets;
CREATE POLICY "hotel_staff_update_tickets" ON public.support_tickets
    FOR UPDATE TO authenticated
    USING (hotel_id = get_user_hotel_id() OR get_user_role() = 'super_admin');

-- Policies for support_ticket_messages
DROP POLICY IF EXISTS "hotel_staff_view_ticket_messages" ON public.support_ticket_messages;
CREATE POLICY "hotel_staff_view_ticket_messages" ON public.support_ticket_messages
    FOR SELECT TO authenticated
    USING (
        ticket_id IN (
            SELECT id FROM public.support_tickets
            WHERE hotel_id = get_user_hotel_id() OR get_user_role() = 'super_admin'
        )
    );

DROP POLICY IF EXISTS "hotel_staff_insert_ticket_messages" ON public.support_ticket_messages;
CREATE POLICY "hotel_staff_insert_ticket_messages" ON public.support_ticket_messages
    FOR INSERT TO authenticated
    WITH CHECK (
        ticket_id IN (
            SELECT id FROM public.support_tickets
            WHERE hotel_id = get_user_hotel_id() OR get_user_role() = 'super_admin'
        )
    );

-- ─────────────────────────────────────────────────────────────────
-- NOTIFICATIONS TABLE (Sprint 13 – referenced by NotificationDrawer)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'system'
        CHECK (type IN ('guest_escalation', 'negative_feedback', 'channel_alert', 'booking_alert', 'compliance_alert', 'system')),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT false,
    link VARCHAR(500),
    priority VARCHAR(20) NOT NULL DEFAULT 'normal'
        CHECK (priority IN ('urgent', 'normal', 'low')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_hotel_id ON public.notifications(hotel_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hotel_staff_view_notifications" ON public.notifications;
CREATE POLICY "hotel_staff_view_notifications" ON public.notifications
    FOR SELECT TO authenticated
    USING (hotel_id = get_user_hotel_id() OR get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "hotel_staff_update_notifications" ON public.notifications;
CREATE POLICY "hotel_staff_update_notifications" ON public.notifications
    FOR UPDATE TO authenticated
    USING (hotel_id = get_user_hotel_id() OR get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "hotel_staff_insert_notifications" ON public.notifications;
CREATE POLICY "hotel_staff_insert_notifications" ON public.notifications
    FOR INSERT TO authenticated
    WITH CHECK (hotel_id = get_user_hotel_id() OR get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "hotel_staff_delete_notifications" ON public.notifications;
CREATE POLICY "hotel_staff_delete_notifications" ON public.notifications
    FOR DELETE TO authenticated
    USING (hotel_id = get_user_hotel_id() OR get_user_role() = 'super_admin');
