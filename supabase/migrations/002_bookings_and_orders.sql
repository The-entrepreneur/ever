-- ═══════════════════════════════════════════════════════════════════════════
-- EVER Platform — Migration: Bookings and Orders
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────────────────────
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
        CREATE TYPE booking_status AS ENUM ('Confirmed', 'Pending', 'Cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_category') THEN
        CREATE TYPE order_category AS ENUM ('Room Service', 'Housekeeping', 'Maintenance');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
        CREATE TYPE order_status AS ENUM ('Pending', 'Preparing', 'Completed');
    END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- BOOKINGS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bookings (
    id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id      UUID            NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    booking_ref   VARCHAR(50)     NOT NULL UNIQUE,
    guest_name    VARCHAR(255)    NOT NULL,
    room_type     VARCHAR(255),
    check_in      DATE            NOT NULL,
    check_out     DATE            NOT NULL,
    total_amount  DECIMAL(10, 2)  DEFAULT 0.00,
    status        booking_status  NOT NULL DEFAULT 'Pending',
    created_at    TIMESTAMP       DEFAULT NOW(),
    updated_at    TIMESTAMP       DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bookings_hotel_id ON public.bookings (hotel_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings (check_in, check_out);

-- ─────────────────────────────────────────────────────────────────────────────
-- ORDERS TABLE
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
    id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id      UUID            NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    booking_id    UUID            REFERENCES public.bookings(id) ON DELETE SET NULL,
    order_ref     VARCHAR(50)     NOT NULL UNIQUE,
    guest_name    VARCHAR(255),
    room_number   VARCHAR(50),
    category      order_category  NOT NULL DEFAULT 'Room Service',
    item          VARCHAR(255)    NOT NULL,
    status        order_status    NOT NULL DEFAULT 'Pending',
    created_at    TIMESTAMP       DEFAULT NOW(),
    updated_at    TIMESTAMP       DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_hotel_id ON public.orders (hotel_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- ─────────────────────────────────────────────────────────────────────────────
-- RLS POLICIES
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view/manage their hotel's bookings and orders
CREATE POLICY "Users can manage their hotel bookings" 
ON public.bookings 
FOR ALL 
TO authenticated 
USING (hotel_id IN (
    SELECT hotel_id FROM public.users WHERE id = auth.uid()
));

CREATE POLICY "Users can manage their hotel orders" 
ON public.orders 
FOR ALL 
TO authenticated 
USING (hotel_id IN (
    SELECT hotel_id FROM public.users WHERE id = auth.uid()
));
