-- Migration 012: Support & Engineering Tickets Suite
-- ============================================================
-- Enables hotel operators and property staff to open direct support & engineering
-- inquiries, converse in real-time threads with the Ever Engineering / Admin team,
-- and track ticket statuses (open, in_progress, resolved).

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
