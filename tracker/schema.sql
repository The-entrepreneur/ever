-- ─────────────────────────────────────────────────────────────
-- Agency Tracker Database Schema
-- Supports billing, performance logs, leads, and handoffs
-- Target Database: Neon / Supabase PostgreSQL (HA Enabled)
-- ─────────────────────────────────────────────────────────────

-- 1. Clients / Hotels
CREATE TABLE IF NOT EXISTS clients (
    slug VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    package VARCHAR(10) DEFAULT 'level1',
    port INT UNIQUE NOT NULL,
    rep_email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Message Event Log
CREATE TABLE IF NOT EXISTS message_events (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) REFERENCES clients(slug) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    direction VARCHAR(5) NOT NULL, -- 'in' | 'out'
    message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Booking Event Log
CREATE TABLE IF NOT EXISTS booking_events (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) REFERENCES clients(slug) ON DELETE CASCADE,
    booking_ref VARCHAR(30) UNIQUE NOT NULL,
    guest_name VARCHAR(100) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    channel VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Leads Storage
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) REFERENCES clients(slug) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    check_in DATE,
    check_out DATE,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'captured',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (email, client_id)
);

-- 5. Monthly Invoicing Tracker
CREATE TABLE IF NOT EXISTS monthly_invoices (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) REFERENCES clients(slug) ON DELETE CASCADE,
    billing_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
    subscription_fee DECIMAL(10, 2) NOT NULL,
    performance_fee DECIMAL(10, 2) NOT NULL,
    total_due DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'paid'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Handoff Sessions
CREATE TABLE IF NOT EXISTS handoff_sessions (
    id SERIAL PRIMARY KEY,
    client_id VARCHAR(50) REFERENCES clients(slug) ON DELETE CASCADE,
    session_id VARCHAR(100) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- 'active' | 'resolved'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);
