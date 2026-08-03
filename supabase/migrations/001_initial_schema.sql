-- ═══════════════════════════════════════════════════════════════════════════
-- EVER Platform — Initial Supabase Schema (All 30 Tables)
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_role') THEN
        CREATE TYPE staff_role AS ENUM ('super_admin', 'agency_staff', 'hotel_manager', 'hotel_receptionist', 'hotel_readonly');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'canceled');
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 1: IDENTITY & ACCESS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.hotels (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        VARCHAR(100)  UNIQUE NOT NULL,
    name        VARCHAR(255)  NOT NULL,
    created_at  TIMESTAMP     DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    hotel_slug VARCHAR(255) NOT NULL UNIQUE,
    tier VARCHAR(50) NOT NULL DEFAULT 'basic', -- 'basic', 'gce', 'hca', 'enterprise'
    status subscription_status NOT NULL DEFAULT 'trial',
    trial_start TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    stripe_customer_id VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_subscriptions_hotel_id ON public.subscriptions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_hotel_slug ON public.subscriptions(hotel_slug);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 2: WHATSAPP & CHANNELS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.whatsapp_accounts (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id            UUID        REFERENCES public.hotels(id) ON DELETE CASCADE,
    phone_number        VARCHAR(20),            -- E.164 format e.g. +2348012345678
    phone_number_id     VARCHAR(100),           -- Meta phone_number_id
    waba_id             VARCHAR(100),           -- WhatsApp Business Account ID
    display_name        VARCHAR(255),           -- Business display name on WhatsApp
    status              VARCHAR(50) DEFAULT 'pending',
    connected_via       VARCHAR(50) DEFAULT 'openbsp_embedded',
    openbsp_token_id    VARCHAR(255),           -- Onboarding token id from OpenBSP
    verify_token        TEXT,                   -- Per-hotel Meta webhook verify secret
    access_token        TEXT,                   -- AES-256 encrypted hotel WABA access token
    callback_url        TEXT,                   -- n8n webhook URL set as callback_url
    connected_at        TIMESTAMP,
    created_at          TIMESTAMP   DEFAULT NOW(),
    updated_at          TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_whatsapp_accounts_hotel_id ON public.whatsapp_accounts (hotel_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_whatsapp_accounts_hotel_phone ON public.whatsapp_accounts (hotel_id, phone_number);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 3: GUEST INTERACTION
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  VARCHAR(255) NOT NULL,
    client_id   UUID        REFERENCES public.hotels(id) ON DELETE CASCADE,
    hotel_slug  VARCHAR(100),
    channel     VARCHAR(50),                    -- website_widget | whatsapp | instagram | facebook | tawkto
    role        VARCHAR(20)  NOT NULL,          -- user | assistant
    content     TEXT         NOT NULL,
    created_at  TIMESTAMP    DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conversations_session_id ON public.conversations (session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON public.conversations (client_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.leads (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID         NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    session_id  VARCHAR(255),
    name        VARCHAR(255),
    email       VARCHAR(255),
    phone       VARCHAR(50),
    check_in    DATE,
    check_out   DATE,
    guests      INTEGER,
    purpose     VARCHAR(255),
    channel     VARCHAR(100),
    lead_quality INTEGER,
    status      VARCHAR(50)  NOT NULL DEFAULT 'captured' CHECK (status IN ('captured', 'contacted', 'booked', 'lost')),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    UNIQUE (email, hotel_id)
);
CREATE INDEX IF NOT EXISTS idx_leads_hotel ON public.leads (hotel_id);

CREATE TABLE IF NOT EXISTS public.feedback (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id  VARCHAR(255) NOT NULL,
    hotel_slug  VARCHAR(100),
    hotel_id    UUID        REFERENCES public.hotels(id) ON DELETE CASCADE,
    channel     VARCHAR(50),
    rating      INTEGER,                        -- 1–5 star rating
    comment     TEXT,                           -- optional free-text follow-up
    status      VARCHAR(50) DEFAULT 'pending_rating',
    created_at  TIMESTAMP   DEFAULT NOW(),
    rated_at    TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_feedback_hotel_id ON public.feedback (hotel_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    channel VARCHAR(50),
    consent_given BOOLEAN,
    consent_timestamp TIMESTAMP DEFAULT NOW(),
    ip_address INET
);

CREATE TABLE IF NOT EXISTS public.marketing_optins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    guest_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    optin_at TIMESTAMP DEFAULT NOW(),
    optout_at TIMESTAMP,
    channel VARCHAR(50),
    optin_method VARCHAR(100)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 4: BOOKINGS & POS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    booking_reference VARCHAR(50),
    guest_name VARCHAR(255),
    room_type VARCHAR(100),
    check_in DATE,
    check_out DATE,
    total_amount DECIMAL(10,2),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_events (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID         NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    booking_id      VARCHAR(50),
    guest_name      VARCHAR(255),
    room_type       VARCHAR(100),
    check_in        DATE,
    check_out       DATE,
    booking_value   DECIMAL(10, 2),
    channel         VARCHAR(100),
    status          VARCHAR(50)  NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'refunded')),
    fee_percentage  DECIMAL(5, 4) NOT NULL DEFAULT 0.0300,
    fee_amount      DECIMAL(10, 2) GENERATED ALWAYS AS (booking_value * fee_percentage) STORED,
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_booking_events_hotel ON public.booking_events (hotel_id);

CREATE TABLE IF NOT EXISTS public.menu_items (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID        NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
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

CREATE TABLE IF NOT EXISTS public.orders (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID        REFERENCES public.hotels(id) ON DELETE CASCADE,
    session_id      VARCHAR(255),
    room_number     VARCHAR(20),
    items           JSONB,                      -- [{menu_item_id, name, qty, unit_price}]
    total_amount    DECIMAL(10,2),
    status          VARCHAR(50) DEFAULT 'pending',
    folio_posted    BOOLEAN     DEFAULT FALSE,
    fee_rate        DECIMAL(5,4) DEFAULT 0.02,  -- 2% ancillary fee
    fee_amount      DECIMAL(10,2) GENERATED ALWAYS AS (total_amount * fee_rate) STORED,
    channel         VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMP   DEFAULT NOW(),
    updated_at      TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.service_requests (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID        REFERENCES public.hotels(id) ON DELETE CASCADE,
    session_id      VARCHAR(255),
    room_number     VARCHAR(20),
    service_type    VARCHAR(100),
    details         JSONB,
    scheduled_for   TIMESTAMP,
    status          VARCHAR(50) DEFAULT 'pending',
    channel         VARCHAR(50),
    created_at      TIMESTAMP   DEFAULT NOW(),
    updated_at      TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.folio_charges (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID        REFERENCES public.hotels(id) ON DELETE CASCADE,
    booking_id      VARCHAR(30),
    order_id        UUID        REFERENCES public.orders(id) ON DELETE SET NULL,
    description     TEXT,
    amount          DECIMAL(10,2),
    pos_reference   VARCHAR(255),
    posted_at       TIMESTAMP   DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 5: KNOWLEDGE BASE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category VARCHAR(100),
    active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    room_id VARCHAR(50),
    type VARCHAR(100),
    rate DECIMAL(10,2),
    capacity INTEGER,
    description TEXT,
    amenities TEXT[],
    available BOOLEAN DEFAULT true,
    image_urls TEXT[],
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.upsells (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    name VARCHAR(255),
    description TEXT,
    price DECIMAL(10,2),
    category VARCHAR(100),
    active BOOLEAN DEFAULT true,
    conversion_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 6: ANALYTICS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.message_events (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID         NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    session_id  VARCHAR(255),
    channel     VARCHAR(100),
    intent      VARCHAR(100),
    lang        VARCHAR(10),
    response_ms INTEGER,
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.handoff_sessions (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id    UUID         NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    session_id  VARCHAR(255) NOT NULL,
    sender_id   VARCHAR(255),
    channel     VARCHAR(100),
    reason      VARCHAR(100),
    status      VARCHAR(50)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'resolved')),
    agent_id    VARCHAR(255),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.monthly_invoices (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id        UUID         NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    period_start    DATE         NOT NULL,
    period_end      DATE         NOT NULL,
    total_bookings  INTEGER,
    total_value     DECIMAL(10, 2),
    fee_amount      DECIMAL(10, 2),
    status          VARCHAR(50)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid')),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (hotel_id, period_start)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 7: NOTIFICATIONS & PUSH
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    type VARCHAR(100),
    title VARCHAR(255),
    body TEXT,
    read BOOLEAN DEFAULT false,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 8: COMPLIANCE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    resource VARCHAR(255),
    detail JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.agency_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_email VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    hotel_slug VARCHAR(100),
    detail JSONB,
    ip_address INET,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dpa_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    dpa_version VARCHAR(50),
    signed_by_name VARCHAR(255),
    signed_by_email VARCHAR(255),
    signed_at TIMESTAMP,
    document_url TEXT,
    review_due DATE
);

CREATE TABLE IF NOT EXISTS public.sub_processors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    purpose TEXT,
    dpa_accepted BOOLEAN DEFAULT true,
    dpa_accepted_at TIMESTAMP DEFAULT NOW(),
    scc_mechanism VARCHAR(255),
    region VARCHAR(100),
    review_due DATE
);

CREATE TABLE IF NOT EXISTS public.dsr_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id UUID REFERENCES public.hotels(id) ON DELETE CASCADE,
    request_type VARCHAR(100),
    guest_email VARCHAR(255),
    received_at TIMESTAMP DEFAULT NOW(),
    due_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'open',
    completed_at TIMESTAMP,
    notes TEXT
);

CREATE TABLE IF NOT EXISTS public.breach_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    detected_at TIMESTAMP DEFAULT NOW(),
    severity VARCHAR(50),
    description TEXT,
    affected_hotel_ids UUID[],
    ndpc_notified_at TIMESTAMP,
    ndpc_reference VARCHAR(255),
    clients_notified_at TIMESTAMP,
    status VARCHAR(50) DEFAULT 'open',
    resolved_at TIMESTAMP
);

-- ─────────────────────────────────────────────────────────────────────────────
-- GROUP 9: ADMIN OPERATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.n8n_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    tier VARCHAR(50),
    version VARCHAR(50),
    json_content JSONB,
    changelog TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    created_by VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    deployed_count INTEGER DEFAULT 0
);

-- ─────────────────────────────────────────────────────────────────────────────
-- RBAC HELPER FUNCTIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role')::text,
    (auth.jwt() -> 'user_metadata' ->> 'role')::text,
    'hotel_readonly'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_hotel_id()
RETURNS uuid AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'hotel_id')::uuid,
    (auth.jwt() -> 'app_metadata' ->> 'hotel_id')::uuid,
    NULL
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ─────────────────────────────────────────────────────────────────────────────
-- Enable RLS on all tables with hotel_id
ALTER TABLE public.hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_optins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folio_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handoff_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dpa_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsr_requests ENABLE ROW LEVEL SECURITY;

-- Helper to generate policies quickly for hotel_id scoped tables
DO $$
DECLARE
    t_name text;
    hotel_tables text[] := ARRAY[
        'users', 'subscriptions', 'whatsapp_accounts', 'leads', 'feedback', 
        'consent_records', 'marketing_optins', 'bookings', 'booking_events', 
        'menu_items', 'orders', 'service_requests', 'folio_charges', 'faqs', 
        'rooms', 'upsells', 'message_events', 'handoff_sessions', 'monthly_invoices',
        'push_subscriptions', 'notifications', 'audit_log', 'dpa_records', 'dsr_requests'
    ];
BEGIN
    -- Super Admin & Agency Staff get ALL access to hotels
    EXECUTE format('CREATE POLICY "super_admin_all" ON public.hotels FOR ALL TO authenticated USING (public.get_user_role() = ''super_admin'');');
    EXECUTE format('CREATE POLICY "agency_staff_select" ON public.hotels FOR SELECT TO authenticated USING (public.get_user_role() = ''agency_staff'');');
    EXECUTE format('CREATE POLICY "hotel_staff_select" ON public.hotels FOR SELECT TO authenticated USING (id = public.get_user_hotel_id());');

    -- Conversations table (has client_id instead of hotel_id)
    EXECUTE format('CREATE POLICY "conv_super_admin" ON public.conversations FOR ALL TO authenticated USING (public.get_user_role() = ''super_admin'');');
    EXECUTE format('CREATE POLICY "conv_hotel_staff" ON public.conversations FOR ALL TO authenticated USING (client_id = public.get_user_hotel_id());');

    FOREACH t_name IN ARRAY hotel_tables
    LOOP
        EXECUTE format('CREATE POLICY "%I_super_admin" ON public.%I FOR ALL TO authenticated USING (public.get_user_role() = ''super_admin'');', t_name, t_name);
        EXECUTE format('CREATE POLICY "%I_hotel_staff" ON public.%I FOR ALL TO authenticated USING (hotel_id = public.get_user_hotel_id());', t_name, t_name);
    END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- IMMUTABILITY TRIGGERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.prevent_update_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Updates and Deletes are not allowed on this audit table.';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_log_immutable
BEFORE UPDATE OR DELETE ON public.audit_log
FOR EACH ROW EXECUTE FUNCTION public.prevent_update_delete();

CREATE TRIGGER trg_agency_audit_log_immutable
BEFORE UPDATE OR DELETE ON public.agency_audit_log
FOR EACH ROW EXECUTE FUNCTION public.prevent_update_delete();

-- ─────────────────────────────────────────────────────────────────────────────
-- VIEWS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW public.monthly_revenue WITH (security_invoker = true) AS
SELECT
    hotel_id,
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*)                         AS total_bookings,
    SUM(booking_value)               AS total_value,
    SUM(fee_amount)                  AS total_fees
FROM public.booking_events
WHERE status = 'confirmed'
GROUP BY hotel_id, DATE_TRUNC('month', created_at);

CREATE OR REPLACE VIEW public.bot_performance WITH (security_invoker = true) AS
SELECT
    hotel_id,
    DATE_TRUNC('day', created_at) AS day,
    COUNT(*)                       AS total_messages,
    AVG(response_ms)               AS avg_response_ms,
    COUNT(*) FILTER (WHERE intent = 'faq')      AS faq_count,
    COUNT(*) FILTER (WHERE intent = 'booking')  AS booking_count,
    COUNT(*) FILTER (WHERE intent = 'fallback') AS fallback_count,
    COUNT(*) FILTER (WHERE intent = 'handoff')  AS handoff_count
FROM public.message_events
GROUP BY hotel_id, DATE_TRUNC('day', created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE
-- ═══════════════════════════════════════════════════════════════════════════
