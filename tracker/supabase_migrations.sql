-- ═══════════════════════════════════════════════════════════════════════════
-- EVER Platform — Supabase Schema Additions
-- Run this entire file in the Supabase SQL editor (agency tracker DB).
-- Required before GCE v4 workflow can log events and before OpenBSP
-- Embedded Signup can store connection state.
--
-- Tables:
--   1. whatsapp_accounts       — OpenBSP / Embedded Signup connection state
--   2. conversations           — Full conversation history (GCE v4 hardening)
--   3. feedback                — Guest post-conversation ratings (GCE v4 hardening)
--   4. orders                  — POS: F&B and purchasable service orders
--   5. service_requests        — POS: Operational service requests (non-revenue)
--   6. menu_items              — POS: Hotel F&B and service catalogue
--   7. folio_charges           — POS: Audit log of room charges posted to PMS
--
-- Also:
--   ALTER TABLE message_events — adds response_ms + intent columns (GCE v4)
-- ═══════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- 0. HOTELS AND USERS (RBAC foundation)
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hotels (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        VARCHAR(100)  UNIQUE NOT NULL,
    name        VARCHAR(255)  NOT NULL,
    created_at  TIMESTAMP     DEFAULT NOW()
);

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN
        CREATE TYPE staff_role AS ENUM ('super_admin', 'agency_staff', 'hotel_manager', 'hotel_receptionist', 'hotel_readonly');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.users (
    id                      UUID        PRIMARY KEY, -- references auth.users(id)
    hotel_id                UUID        REFERENCES public.hotels(id) ON DELETE CASCADE,
    email                   VARCHAR(255) NOT NULL UNIQUE,
    full_name               VARCHAR(255),
    role                    staff_role  NOT NULL DEFAULT 'hotel_receptionist',
    status                  VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    receive_handoff_alerts  BOOLEAN     DEFAULT TRUE,
    online_status           BOOLEAN     DEFAULT FALSE,
    last_login              TIMESTAMP,
    created_at              TIMESTAMP   DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. WHATSAPP_ACCOUNTS
-- Stores per-hotel WhatsApp connection state for OpenBSP Embedded Signup.
-- One row per hotel phone number.
-- access_token must be AES-256 encrypted at the application layer before
-- writing — do NOT rely solely on Supabase at-rest encryption for this field.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS whatsapp_accounts (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id            UUID        REFERENCES hotels(id) ON DELETE CASCADE,
    phone_number        VARCHAR(20),            -- E.164 format e.g. +2348012345678
    phone_number_id     VARCHAR(100),           -- Meta phone_number_id
    waba_id             VARCHAR(100),           -- WhatsApp Business Account ID
    display_name        VARCHAR(255),           -- Business display name on WhatsApp
    status              VARCHAR(50) DEFAULT 'pending',
        -- pending | connected | disconnected | error
    connected_via       VARCHAR(50) DEFAULT 'openbsp_embedded',
        -- openbsp_embedded | openbsp_manual | evolution | cloud_api
    openbsp_token_id    VARCHAR(255),           -- Onboarding token id from OpenBSP
    verify_token        TEXT,                   -- Per-hotel Meta webhook verify secret
    access_token        TEXT,                   -- AES-256 encrypted hotel WABA access token
    callback_url        TEXT,                   -- n8n webhook URL set as callback_url
    connected_at        TIMESTAMP,
    created_at          TIMESTAMP   DEFAULT NOW(),
    updated_at          TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_hotel_id
    ON whatsapp_accounts (hotel_id);

CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_phone_number_id
    ON whatsapp_accounts (phone_number_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_accounts_hotel_phone
    ON whatsapp_accounts (hotel_id, phone_number);


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. CONVERSATIONS
-- Full conversation history per session, per hotel.
-- Used by GCE v4 "Load Conversation History" node to inject the last 10 turns
-- into the system prompt for returning guests.
-- Retention: 90 days via pg_cron (schedule separately in Supabase).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  VARCHAR(255) NOT NULL,
    client_id   UUID,                           -- hotel_id reference (optional FK)
    hotel_slug  VARCHAR(100),
    channel     VARCHAR(50),                    -- website_widget | whatsapp | instagram | facebook | tawkto
    role        VARCHAR(20)  NOT NULL,          -- user | assistant
    content     TEXT         NOT NULL,
    created_at  TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conversations_session_id
    ON conversations (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversations_hotel_slug
    ON conversations (hotel_slug, created_at DESC);

-- Retention: auto-delete rows older than 90 days.
-- Requires pg_cron extension enabled in Supabase:
-- SELECT cron.schedule('delete-old-conversations', '0 3 * * *',
--   $$DELETE FROM conversations WHERE created_at < NOW() - INTERVAL '90 days'$$);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. FEEDBACK
-- Guest post-conversation star ratings (1–5).
-- Written by the GCE v4 "Save Feedback Response" node.
-- Ratings 4–5 trigger a Google Review link. Ratings 1–2 trigger a manager alert.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  VARCHAR(255) NOT NULL,
    hotel_slug  VARCHAR(100),
    hotel_id    UUID,
    channel     VARCHAR(50),
    rating      INTEGER,                        -- 1–5 star rating
    comment     TEXT,                           -- optional free-text follow-up
    status      VARCHAR(50) DEFAULT 'pending_rating',
        -- pending_rating | rated | skipped
    created_at  TIMESTAMP   DEFAULT NOW(),
    rated_at    TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_feedback_session_id
    ON feedback (session_id);

CREATE INDEX IF NOT EXISTS idx_feedback_hotel_slug
    ON feedback (hotel_slug, created_at DESC);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. ORDERS
-- F&B room service, spa bookings, airport transfers — any in-chat order
-- with a charge posted directly to the guest's room folio.
-- Performance fee: 2% of total_amount (see revenue model extension).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID,
    session_id      VARCHAR(255),
    room_number     VARCHAR(20),
    items           JSONB,                      -- [{menu_item_id, name, qty, unit_price}]
    total_amount    DECIMAL(10,2),
    status          VARCHAR(50) DEFAULT 'pending',
        -- pending | confirmed | preparing | delivered | cancelled
    folio_posted    BOOLEAN     DEFAULT FALSE,
    fee_rate        DECIMAL(5,4) DEFAULT 0.02,  -- 2% ancillary fee
    fee_amount      DECIMAL(10,2)               -- GENERATED in application layer: total_amount * fee_rate
        GENERATED ALWAYS AS (total_amount * fee_rate) STORED,
    channel         VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMP   DEFAULT NOW(),
    updated_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_hotel_id
    ON orders (hotel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_session_id
    ON orders (session_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 5. SERVICE_REQUESTS
-- Non-revenue operational requests: housekeeping, extra pillows, wake-up calls,
-- restaurant reservations (payment at table). Performance fee: 0%.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_requests (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID,
    session_id      VARCHAR(255),
    room_number     VARCHAR(20),
    service_type    VARCHAR(100),               -- laundry | housekeeping | wakeup | restaurant | other
    details         JSONB,                      -- service-specific detail fields
    scheduled_for   TIMESTAMP,                  -- for wake-up calls, restaurant reservations
    status          VARCHAR(50) DEFAULT 'pending',
        -- pending | acknowledged | in_progress | completed | cancelled
    channel         VARCHAR(50),
    created_at      TIMESTAMP   DEFAULT NOW(),
    updated_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_requests_hotel_id
    ON service_requests (hotel_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_requests_session_id
    ON service_requests (session_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- 6. MENU_ITEMS
-- Hotel F&B and service catalogue. Read by the POS adapter to present
-- available items and prices to guests in chat.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID        NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    price           DECIMAL(10,2),
    category        VARCHAR(100),               -- food | beverage | spa | transport | other
    available       BOOLEAN     DEFAULT TRUE,
    image_url       TEXT,
    prep_time_mins  INTEGER,
    created_at      TIMESTAMP   DEFAULT NOW(),
    updated_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_items_hotel_id
    ON menu_items (hotel_id, category);


-- ─────────────────────────────────────────────────────────────────────────────
-- 7. FOLIO_CHARGES
-- Audit log of every charge posted to the PMS room folio.
-- Written by pos_adapter.py after successful folio post.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS folio_charges (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID,
    booking_id      VARCHAR(30),
    order_id        UUID        REFERENCES orders(id),
    description     TEXT,
    amount          DECIMAL(10,2),
    pos_reference   VARCHAR(255),               -- POS system's own transaction reference
    posted_at       TIMESTAMP   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_folio_charges_hotel_id
    ON folio_charges (hotel_id, posted_at DESC);

CREATE INDEX IF NOT EXISTS idx_folio_charges_booking_id
    ON folio_charges (booking_id);


-- ─────────────────────────────────────────────────────────────────────────────
-- ALTER: message_events — add columns required by GCE v4 hardened workflow
-- These columns are written by services/tracker.js logMessageEvent().
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE message_events
    ADD COLUMN IF NOT EXISTS response_ms INTEGER,
    ADD COLUMN IF NOT EXISTS intent      VARCHAR(100);


-- ─────────────────────────────────────────────────────────────────────────────
-- 8. JWT METADATA & RBAC HELPER FUNCTIONS
-- Extracts custom role and hotel scope claims from Supabase Auth JWT.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION auth.get_user_role()
RETURNS text AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'hotel_readonly'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.get_user_hotel_id()
RETURNS uuid AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'hotel_id')::uuid,
    (auth.jwt() -> 'app_metadata' ->> 'hotel_id')::uuid,
    NULL
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- ─────────────────────────────────────────────────────────────────────────────
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- Enables and configures RLS policies per-role.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folio_charges ENABLE ROW LEVEL SECURITY;

-- 9.1 HOTELS POLICIES
CREATE POLICY hotels_super_admin ON public.hotels
    FOR ALL TO authenticated USING (auth.get_user_role() = 'super_admin');

CREATE POLICY hotels_agency_staff ON public.hotels
    FOR SELECT TO authenticated USING (auth.get_user_role() = 'agency_staff');

CREATE POLICY hotels_hotel_staff ON public.hotels
    FOR SELECT TO authenticated USING (
        auth.get_user_role() IN ('hotel_manager', 'hotel_receptionist', 'hotel_readonly') 
        AND id = auth.get_user_hotel_id()
    );

-- 9.2 USERS POLICIES
CREATE POLICY users_super_admin ON public.users
    FOR ALL TO authenticated USING (auth.get_user_role() = 'super_admin');

CREATE POLICY users_agency_staff ON public.users
    FOR SELECT TO authenticated USING (auth.get_user_role() = 'agency_staff');

CREATE POLICY users_hotel_manager ON public.users
    FOR ALL TO authenticated USING (
        auth.get_user_role() = 'hotel_manager' 
        AND hotel_id = auth.get_user_hotel_id()
    );

CREATE POLICY users_hotel_staff ON public.users
    FOR SELECT TO authenticated USING (
        auth.get_user_role() IN ('hotel_receptionist', 'hotel_readonly') 
        AND hotel_id = auth.get_user_hotel_id()
    );

-- 9.3 WHATSAPP_ACCOUNTS POLICIES
CREATE POLICY wa_super_admin ON public.whatsapp_accounts
    FOR ALL TO authenticated USING (auth.get_user_role() = 'super_admin');

CREATE POLICY wa_agency_staff ON public.whatsapp_accounts
    FOR SELECT TO authenticated USING (auth.get_user_role() = 'agency_staff');

CREATE POLICY wa_hotel_manager ON public.whatsapp_accounts
    FOR ALL TO authenticated USING (
        auth.get_user_role() = 'hotel_manager' 
        AND hotel_id = auth.get_user_hotel_id()
    );

CREATE POLICY wa_hotel_receptionist ON public.whatsapp_accounts
    FOR SELECT TO authenticated USING (
        auth.get_user_role() = 'hotel_receptionist' 
        AND hotel_id = auth.get_user_hotel_id()
    );

-- 9.4 CONVERSATIONS POLICIES
CREATE POLICY conv_super_admin ON public.conversations
    FOR ALL TO authenticated USING (auth.get_user_role() = 'super_admin');

CREATE POLICY conv_agency_staff ON public.conversations
    FOR SELECT TO authenticated USING (auth.get_user_role() = 'agency_staff');

CREATE POLICY conv_hotel_staff ON public.conversations
    FOR ALL TO authenticated USING (
        auth.get_user_role() IN ('hotel_manager', 'hotel_receptionist') 
        AND client_id = auth.get_user_hotel_id()
    );

CREATE POLICY conv_hotel_readonly ON public.conversations
    FOR SELECT TO authenticated USING (
        auth.get_user_role() = 'hotel_readonly' 
        AND client_id = auth.get_user_hotel_id()
    );

-- 9.5 FEEDBACK POLICIES
CREATE POLICY fb_super_admin ON public.feedback
    FOR ALL TO authenticated USING (auth.get_user_role() = 'super_admin');

CREATE POLICY fb_agency_staff ON public.feedback
    FOR SELECT TO authenticated USING (auth.get_user_role() = 'agency_staff');

CREATE POLICY fb_hotel_staff ON public.feedback
    FOR SELECT TO authenticated USING (
        auth.get_user_role() IN ('hotel_manager', 'hotel_receptionist', 'hotel_readonly') 
        AND hotel_id = auth.get_user_hotel_id()
    );

-- 9.6 ORDERS POLICIES
CREATE POLICY ord_super_admin ON public.orders
    FOR ALL TO authenticated USING (auth.get_user_role() = 'super_admin');

CREATE POLICY ord_agency_staff ON public.orders
    FOR SELECT TO authenticated USING (auth.get_user_role() = 'agency_staff');

CREATE POLICY ord_hotel_staff ON public.orders
    FOR ALL TO authenticated USING (
        auth.get_user_role() IN ('hotel_manager', 'hotel_receptionist') 
        AND hotel_id = auth.get_user_hotel_id()
    );

CREATE POLICY ord_hotel_readonly ON public.orders
    FOR SELECT TO authenticated USING (
        auth.get_user_role() = 'hotel_readonly' 
        AND hotel_id = auth.get_user_hotel_id()
    );

-- 9.7 SERVICE_REQUESTS POLICIES
CREATE POLICY sr_super_admin ON public.service_requests
    FOR ALL TO authenticated USING (auth.get_user_role() = 'super_admin');

CREATE POLICY sr_agency_staff ON public.service_requests
    FOR SELECT TO authenticated USING (auth.get_user_role() = 'agency_staff');

CREATE POLICY sr_hotel_staff ON public.service_requests
    FOR ALL TO authenticated USING (
        auth.get_user_role() IN ('hotel_manager', 'hotel_receptionist') 
        AND hotel_id = auth.get_user_hotel_id()
    );

CREATE POLICY sr_hotel_readonly ON public.service_requests
    FOR SELECT TO authenticated USING (
        auth.get_user_role() = 'hotel_readonly' 
        AND hotel_id = auth.get_user_hotel_id()
    );

-- 9.8 MENU_ITEMS POLICIES
CREATE POLICY mi_super_admin ON public.menu_items
    FOR ALL TO authenticated USING (auth.get_user_role() = 'super_admin');

CREATE POLICY mi_agency_staff ON public.menu_items
    FOR SELECT TO authenticated USING (auth.get_user_role() = 'agency_staff');

CREATE POLICY mi_hotel_manager ON public.menu_items
    FOR ALL TO authenticated USING (
        auth.get_user_role() = 'hotel_manager' 
        AND hotel_id = auth.get_user_hotel_id()
    );

CREATE POLICY mi_hotel_receptionist ON public.menu_items
    FOR SELECT TO authenticated USING (
        auth.get_user_role() = 'hotel_receptionist' 
        AND hotel_id = auth.get_user_hotel_id()
    );

-- 9.9 FOLIO_CHARGES POLICIES
CREATE POLICY fc_super_admin ON public.folio_charges
    FOR ALL TO authenticated USING (auth.get_user_role() = 'super_admin');

CREATE POLICY fc_agency_staff ON public.folio_charges
    FOR SELECT TO authenticated USING (auth.get_user_role() = 'agency_staff');

CREATE POLICY fc_hotel_staff ON public.folio_charges
    FOR SELECT TO authenticated USING (
        auth.get_user_role() IN ('hotel_manager', 'hotel_receptionist', 'hotel_readonly') 
        AND hotel_id = auth.get_user_hotel_id()
    );

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES
-- Run after migration to confirm all tables exist and RLS policies are active.
-- ─────────────────────────────────────────────────────────────────────────────
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- Expected: 9 tables with rowsecurity = true.

