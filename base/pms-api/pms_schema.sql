-- ─────────────────────────────────────────────────────────────
-- PMS Database Schema — per-client PostgreSQL
-- Tables: rooms, bookings
-- Separate from the agency tracker DB (schema.sql)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS rooms (
    room_id         VARCHAR(20)    PRIMARY KEY,
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

CREATE TABLE IF NOT EXISTS bookings (
    id              SERIAL         PRIMARY KEY,
    booking_ref     VARCHAR(30)    UNIQUE NOT NULL,
    room_id         VARCHAR(20)    REFERENCES rooms(room_id),
    guest_name      VARCHAR(100)   NOT NULL,
    email           VARCHAR(100)   NOT NULL,
    phone           VARCHAR(30),
    check_in        DATE           NOT NULL,
    check_out       DATE           NOT NULL,
    guests          INT            NOT NULL DEFAULT 1,
    total           DECIMAL(10,2)  NOT NULL,
    currency        VARCHAR(3)     DEFAULT 'GBP',
    status          VARCHAR(20)    DEFAULT 'pending_payment',
    -- status options: pending_payment | confirmed | cancelled | expired | failed
    stripe_session_id VARCHAR(100),
    confirmed_at    TIMESTAMP,
    created_at      TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- Index for date-range availability queries
CREATE INDEX IF NOT EXISTS idx_bookings_room_dates
    ON bookings (room_id, check_in, check_out)
    WHERE status NOT IN ('cancelled', 'failed', 'expired');
