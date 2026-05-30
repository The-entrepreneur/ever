-- ─────────────────────────────────────────────────────────────────────────────
-- Agency Tracker Database Schema
-- Hosted on Neon or Supabase (managed PostgreSQL — HA, VPS-independent)
-- Run this file once to initialise the schema
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── CLIENTS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
    id          VARCHAR(100) PRIMARY KEY,   -- hotel slug e.g. "grand-horizon"
    name        VARCHAR(255) NOT NULL,
    plan        VARCHAR(20)  NOT NULL CHECK (plan IN ('level1', 'level2')),
    status      VARCHAR(20)  NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled')),
    rep_email   VARCHAR(255),
    joined_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP
);

-- ── LEADS ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id   VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_id  VARCHAR(255),
    name        VARCHAR(255),
    email       VARCHAR(255),
    phone       VARCHAR(50),
    check_in    DATE,
    check_out   DATE,
    guests      INTEGER,
    purpose     VARCHAR(255),
    channel     VARCHAR(100),
    status      VARCHAR(50)  NOT NULL DEFAULT 'captured' CHECK (status IN ('captured', 'booked', 'lost')),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMP,
    UNIQUE (email, client_id)
);
CREATE INDEX IF NOT EXISTS idx_leads_client    ON leads (client_id);
CREATE INDEX IF NOT EXISTS idx_leads_status    ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created   ON leads (created_at DESC);

-- ── MESSAGE EVENTS ────────────────────────────────────────────────────────────
-- Metadata only — no PII stored here
CREATE TABLE IF NOT EXISTS message_events (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id   VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_id  VARCHAR(255),
    channel     VARCHAR(100),
    intent      VARCHAR(100),  -- faq | booking | fallback | handoff
    lang        VARCHAR(10),
    response_ms INTEGER,       -- response time in milliseconds
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_msg_client  ON message_events (client_id);
CREATE INDEX IF NOT EXISTS idx_msg_created ON message_events (created_at DESC);

-- ── BOOKING EVENTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_events (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_booking_client  ON booking_events (client_id);
CREATE INDEX IF NOT EXISTS idx_booking_created ON booking_events (created_at DESC);

-- ── HANDOFF SESSIONS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS handoff_sessions (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id   VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_id  VARCHAR(255) NOT NULL,
    sender_id   VARCHAR(255),
    channel     VARCHAR(100),
    reason      VARCHAR(100), -- guest_request | complaint | complex_request | fallback_loop
    status      VARCHAR(50)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'resolved')),
    agent_id    VARCHAR(255),
    created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_handoff_client  ON handoff_sessions (client_id);
CREATE INDEX IF NOT EXISTS idx_handoff_status  ON handoff_sessions (status);

-- ── MONTHLY INVOICES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS monthly_invoices (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       VARCHAR(100) NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    period_start    DATE         NOT NULL,
    period_end      DATE         NOT NULL,
    total_bookings  INTEGER,
    total_value     DECIMAL(10, 2),
    fee_amount      DECIMAL(10, 2),
    status          VARCHAR(50)  NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'paid')),
    created_at      TIMESTAMP    NOT NULL DEFAULT NOW(),
    UNIQUE (client_id, period_start)
);

-- ── VIEWS ─────────────────────────────────────────────────────────────────────
-- Monthly revenue summary per client
CREATE OR REPLACE VIEW monthly_revenue AS
SELECT
    client_id,
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*)                         AS total_bookings,
    SUM(booking_value)               AS total_value,
    SUM(fee_amount)                  AS total_fees
FROM booking_events
WHERE status = 'confirmed'
GROUP BY client_id, DATE_TRUNC('month', created_at);

-- Bot performance summary per client
CREATE OR REPLACE VIEW bot_performance AS
SELECT
    client_id,
    DATE_TRUNC('day', created_at) AS day,
    COUNT(*)                       AS total_messages,
    AVG(response_ms)               AS avg_response_ms,
    COUNT(*) FILTER (WHERE intent = 'faq')      AS faq_count,
    COUNT(*) FILTER (WHERE intent = 'booking')  AS booking_count,
    COUNT(*) FILTER (WHERE intent = 'fallback') AS fallback_count,
    COUNT(*) FILTER (WHERE intent = 'handoff')  AS handoff_count
FROM message_events
GROUP BY client_id, DATE_TRUNC('day', created_at);
