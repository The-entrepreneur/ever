-- ─────────────────────────────────────────────────────────────
-- PMS Database Schema — per-client PostgreSQL
-- Tables: rooms, bookings, menu_items, orders,
--         service_requests, folio_charges
-- Separate from the agency tracker DB (Supabase).
-- Run this on the hotel's local PostgreSQL instance.
-- ─────────────────────────────────────────────────────────────

-- ─── ROOMS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rooms (
    room_id         VARCHAR(20)    PRIMARY KEY,
    hotel_slug      VARCHAR(100)   NOT NULL DEFAULT 'hotel',
    type            VARCHAR(50)    NOT NULL,
    rate_per_night  DECIMAL(10,2)  NOT NULL,
    capacity        INT            NOT NULL DEFAULT 2,
    description     TEXT,
    amenities       TEXT,
    available       BOOLEAN        NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- Seed default rooms (idempotent)
INSERT INTO rooms (room_id, type, rate_per_night, capacity, description, amenities)
VALUES
    ('rm_std',   'Standard', 89.00,  2, 'Cosy room with garden view.',        'TV, AC, En-suite, Safe'),
    ('rm_dlx',   'Deluxe',   129.00, 2, 'Spacious room with city view.',       'King bed, Minibar, Bathrobe'),
    ('rm_suite', 'Suite',    199.00, 4, 'Panoramic views, separate lounge.',   'Nespresso, Robe, Lounge')
ON CONFLICT (room_id) DO NOTHING;


-- ─── BOOKINGS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
    id                  SERIAL         PRIMARY KEY,
    booking_ref         VARCHAR(30)    UNIQUE NOT NULL,
    hotel_slug          VARCHAR(100)   NOT NULL DEFAULT 'hotel',
    room_id             VARCHAR(20)    REFERENCES rooms(room_id),
    name                VARCHAR(100)   NOT NULL,
    email               VARCHAR(100)   NOT NULL,
    phone               VARCHAR(30),
    check_in            DATE           NOT NULL,
    check_out           DATE           NOT NULL,
    guests              INT            NOT NULL DEFAULT 1,
    total               DECIMAL(10,2)  NOT NULL,
    currency            VARCHAR(3)     DEFAULT 'GBP',
    status              VARCHAR(20)    DEFAULT 'pending_payment',
    -- status: pending_payment | confirmed | cancelled | expired | failed
    payment_reference   VARCHAR(100),  -- Provider txn ref
    payment_provider    VARCHAR(20),   -- paystack | flutterwave | stripe
    confirmed_at        TIMESTAMP,
    created_at          TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- Index for date-range availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_room_dates
    ON bookings (room_id, check_in, check_out)
    WHERE status NOT IN ('cancelled', 'failed', 'expired');

CREATE INDEX IF NOT EXISTS idx_bookings_hotel_slug
    ON bookings (hotel_slug, created_at DESC);


-- ─── MENU_ITEMS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS menu_items (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_slug      VARCHAR(100)   NOT NULL,
    name            VARCHAR(255)   NOT NULL,
    description     TEXT,
    price           DECIMAL(10,2)  NOT NULL,
    category        VARCHAR(100)   NOT NULL,
    -- category: f&b | spa | transport | other
    available       BOOLEAN        DEFAULT TRUE,
    image_url       TEXT,
    prep_time_mins  INTEGER,
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_items_hotel_cat
    ON menu_items (hotel_slug, category)
    WHERE available = TRUE;

-- Seed sample menu items
INSERT INTO menu_items (hotel_slug, name, description, price, category, prep_time_mins)
VALUES
    ('hotel', 'Club Sandwich',      'Chicken, bacon, lettuce, tomato on toasted white', 14.50, 'f&b', 20),
    ('hotel', 'Caesar Salad',       'Romaine lettuce, parmesan, house caesar dressing',  11.00, 'f&b', 10),
    ('hotel', 'Cheeseburger',       'Beef patty, cheddar, caramelised onions, fries',   16.00, 'f&b', 25),
    ('hotel', 'Bottle of Water',    'Still 500ml',                                        2.50, 'f&b',  2),
    ('hotel', 'Sparkling Water',    'Sparkling 500ml',                                    2.50, 'f&b',  2),
    ('hotel', 'House Wine (Glass)', 'Red or White',                                       7.50, 'f&b',  3),
    ('hotel', 'Swedish Massage',    '60-minute full body relaxation massage',            75.00, 'spa', 60),
    ('hotel', 'Airport Transfer',   'Private car to/from major airport',                55.00, 'transport', NULL)
ON CONFLICT DO NOTHING;


-- ─── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_slug      VARCHAR(100)   NOT NULL,
    session_id      VARCHAR(255),
    room_number     VARCHAR(20),
    items           JSONB          NOT NULL,
    total_amount    DECIMAL(10,2)  NOT NULL,
    status          VARCHAR(50)    DEFAULT 'pending',
    -- status: pending | confirmed | preparing | delivered | cancelled | manual_required
    folio_posted    BOOLEAN        DEFAULT FALSE,
    channel         VARCHAR(50),
    notes           TEXT,
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_orders_hotel_slug
    ON orders (hotel_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_session_id
    ON orders (session_id);


-- ─── SERVICE_REQUESTS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS service_requests (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_slug      VARCHAR(100)   NOT NULL,
    session_id      VARCHAR(255),
    room_number     VARCHAR(20),
    service_type    VARCHAR(100)   NOT NULL,
    -- type: laundry | housekeeping | wakeup | restaurant | other
    details         JSONB,
    scheduled_for   TIMESTAMP,
    status          VARCHAR(50)    DEFAULT 'pending',
    -- status: pending | acknowledged | in_progress | completed | cancelled
    channel         VARCHAR(50),
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_service_requests_hotel_slug
    ON service_requests (hotel_slug, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_service_requests_session_id
    ON service_requests (session_id);


-- ─── FOLIO_CHARGES ────────────────────────────────────────────────────────────
-- Audit log of every charge posted to the PMS room folio.
-- Written by pos_adapter.py after each folio.charge.posted event.
CREATE TABLE IF NOT EXISTS folio_charges (
    id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_slug      VARCHAR(100),
    booking_id      VARCHAR(30),  -- booking_ref or room_number depending on PMS lookup
    order_id        UUID          REFERENCES orders(id),
    description     TEXT,
    amount          DECIMAL(10,2) NOT NULL,
    pos_reference   VARCHAR(255), -- PMS system's own transaction reference
    posted_at       TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_folio_charges_hotel_slug
    ON folio_charges (hotel_slug, posted_at DESC);

CREATE INDEX IF NOT EXISTS idx_folio_charges_order_id
    ON folio_charges (order_id);

