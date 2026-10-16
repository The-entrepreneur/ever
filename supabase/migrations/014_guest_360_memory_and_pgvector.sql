-- ===================================================================
-- Migration 014: GUEST 360 MEMORY & pgvector Knowledge Base Engine
-- ===================================================================
-- 1. Creates public.guests entity for cross-stay / cross-channel Guest 360 Memory.
-- 2. Links bookings, orders, and leads to persistent guest profiles.
-- 3. Enables pgvector extension and creates semantic vector columns & cosine search.
-- 4. Provides lookup_guest_360() RPC for instant prompt context injection.
-- 5. Establishes tenant-isolated Row Level Security (RLS) policies.
-- ===================================================================

-- ─────────────────────────────────────────────────────────────────
-- STEP 1: ENABLE PGVECTOR EXTENSION
-- ─────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

-- ─────────────────────────────────────────────────────────────────
-- STEP 2: CREATE GUESTS TABLE (GUEST 360 MEMORY)
-- ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.guests (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hotel_id              UUID NOT NULL REFERENCES public.hotels(id) ON DELETE CASCADE,
    full_name             VARCHAR(255) NOT NULL,
    first_name            VARCHAR(100),
    last_name             VARCHAR(100),
    email                 VARCHAR(255),
    phone                 VARCHAR(50),                     -- E.164 formatted string
    vip_tier              VARCHAR(50) NOT NULL DEFAULT 'standard'
                          CHECK (vip_tier IN ('standard', 'silver', 'gold', 'vip', 'black')),
    stay_count            INTEGER NOT NULL DEFAULT 0,
    total_spend           DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    room_preferences      JSONB NOT NULL DEFAULT '[]'::jsonb,      -- e.g. ["high_floor", "quiet_room", "king_bed"]
    dietary_preferences   JSONB NOT NULL DEFAULT '[]'::jsonb,      -- e.g. ["vegan", "shellfish_allergy"]
    special_notes         TEXT,                                    -- Concierge & front-desk observations
    tags                  TEXT[] NOT NULL DEFAULT '{}',            -- e.g. ['corporate', 'anniversary_guest']
    last_stay_at          TIMESTAMP WITH TIME ZONE,
    last_contact_channel  VARCHAR(50),                             -- whatsapp | website_widget | instagram | facebook | tawkto
    created_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for lightning-fast lookup by channel identifier (phone or email)
CREATE INDEX IF NOT EXISTS idx_guests_hotel_id ON public.guests(hotel_id);
CREATE INDEX IF NOT EXISTS idx_guests_phone ON public.guests(hotel_id, phone);
CREATE INDEX IF NOT EXISTS idx_guests_email ON public.guests(hotel_id, email);
CREATE INDEX IF NOT EXISTS idx_guests_vip ON public.guests(hotel_id, vip_tier);

-- ─────────────────────────────────────────────────────────────────
-- STEP 3: LINK BOOKINGS & ORDERS TO GUESTS TABLE
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.bookings
    ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON public.bookings(guest_id);

ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_guest_id ON public.orders(guest_id);

-- ─────────────────────────────────────────────────────────────────
-- STEP 4: VECTOR EMBEDDING COLUMNS & HNSW INDEXES FOR RAG
-- ─────────────────────────────────────────────────────────────────
-- Add vector embeddings (1536-dim standard, e.g. text-embedding-3-small)
ALTER TABLE public.faqs
    ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE public.rooms
    ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- HNSW indexes for sub-millisecond similarity search
CREATE INDEX IF NOT EXISTS idx_faqs_embedding_hnsw 
    ON public.faqs USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_rooms_embedding_hnsw 
    ON public.rooms USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- ─────────────────────────────────────────────────────────────────
-- STEP 5: RPC FUNCTION — MATCH FAQS (SEMANTIC RAG RETRIEVAL)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.match_faqs(
    query_embedding vector(1536),
    match_hotel_id  UUID,
    match_threshold FLOAT DEFAULT 0.65,
    match_count     INT DEFAULT 3
)
RETURNS TABLE (
    id         UUID,
    question   TEXT,
    answer     TEXT,
    category   VARCHAR,
    similarity FLOAT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.question,
        f.answer,
        f.category,
        1 - (f.embedding <=> query_embedding) AS similarity
    FROM public.faqs f
    WHERE f.hotel_id = match_hotel_id
      AND f.active = true
      AND f.embedding IS NOT NULL
      AND (1 - (f.embedding <=> query_embedding)) >= match_threshold
    ORDER BY f.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- STEP 6: RPC FUNCTION — LOOKUP GUEST 360 MEMORY
-- ─────────────────────────────────────────────────────────────────
-- Formats the guest profile, past stay count, preferences, and recent
-- booking notes into a clean JSON structure ready for prompt injection.
CREATE OR REPLACE FUNCTION public.lookup_guest_360(
    p_hotel_id    UUID,
    p_identifier  TEXT   -- Can be phone (e.g. +234..., 080...) or email
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_clean_phone TEXT;
    v_guest RECORD;
    v_recent_booking RECORD;
    v_result JSONB;
BEGIN
    -- Strip non-digit characters for phone comparison if not an email
    IF p_identifier LIKE '%@%' THEN
        SELECT * INTO v_guest
        FROM public.guests
        WHERE hotel_id = p_hotel_id
          AND LOWER(TRIM(email)) = LOWER(TRIM(p_identifier))
        LIMIT 1;
    ELSE
        v_clean_phone := regexp_replace(p_identifier, '[^0-9+]', '', 'g');
        SELECT * INTO v_guest
        FROM public.guests
        WHERE hotel_id = p_hotel_id
          AND (
            phone = v_clean_phone 
            OR phone = p_identifier 
            OR right(phone, 10) = right(v_clean_phone, 10)
          )
        LIMIT 1;
    END IF;

    -- If no guest found, return null
    IF v_guest.id IS NULL THEN
        RETURN NULL;
    END IF;

    -- Fetch most recent booking details if available
    SELECT room_type, check_in, check_out, status
    INTO v_recent_booking
    FROM public.bookings
    WHERE hotel_id = p_hotel_id
      AND (guest_id = v_guest.id OR LOWER(guest_name) = LOWER(v_guest.full_name))
    ORDER BY check_in DESC
    LIMIT 1;

    -- Build consolidated Guest 360 payload
    v_result := jsonb_build_object(
        'guest_id',            v_guest.id,
        'full_name',           v_guest.full_name,
        'first_name',          COALESCE(v_guest.first_name, split_part(v_guest.full_name, ' ', 1)),
        'email',               v_guest.email,
        'phone',               v_guest.phone,
        'vip_tier',            v_guest.vip_tier,
        'stay_count',          v_guest.stay_count,
        'total_spend',         v_guest.total_spend,
        'room_preferences',    v_guest.room_preferences,
        'dietary_preferences', v_guest.dietary_preferences,
        'special_notes',       v_guest.special_notes,
        'tags',                v_guest.tags,
        'last_stay_at',        v_guest.last_stay_at,
        'recent_booking', CASE 
            WHEN v_recent_booking.room_type IS NOT NULL THEN
                jsonb_build_object(
                    'room_type',  v_recent_booking.room_type,
                    'check_in',   v_recent_booking.check_in,
                    'check_out',  v_recent_booking.check_out,
                    'status',     v_recent_booking.status
                )
            ELSE NULL 
        END
    );

    RETURN v_result;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- STEP 7: RPC FUNCTION — UPSERT GUEST 360 PROFILE
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.upsert_guest_360(
    p_hotel_id            UUID,
    p_full_name           TEXT,
    p_email               TEXT DEFAULT NULL,
    p_phone               TEXT DEFAULT NULL,
    p_room_preference     TEXT DEFAULT NULL,
    p_dietary_preference  TEXT DEFAULT NULL,
    p_special_notes       TEXT DEFAULT NULL,
    p_channel             TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_guest_id UUID;
    v_existing_room_prefs JSONB;
    v_existing_diet_prefs JSONB;
BEGIN
    -- Check for existing guest by phone or email
    SELECT id, room_preferences, dietary_preferences 
    INTO v_guest_id, v_existing_room_prefs, v_existing_diet_prefs
    FROM public.guests
    WHERE hotel_id = p_hotel_id
      AND (
        (p_phone IS NOT NULL AND phone = p_phone)
        OR (p_email IS NOT NULL AND LOWER(email) = LOWER(p_email))
      )
    LIMIT 1;

    IF v_guest_id IS NOT NULL THEN
        -- Update existing record
        UPDATE public.guests
        SET
            full_name = COALESCE(p_full_name, full_name),
            email = COALESCE(p_email, email),
            phone = COALESCE(p_phone, phone),
            last_contact_channel = COALESCE(p_channel, last_contact_channel),
            special_notes = CASE 
                WHEN p_special_notes IS NOT NULL THEN 
                    COALESCE(special_notes || E'\n', '') || p_special_notes
                ELSE special_notes 
            END,
            room_preferences = CASE 
                WHEN p_room_preference IS NOT NULL AND NOT (v_existing_room_prefs ? p_room_preference)
                THEN v_existing_room_prefs || jsonb_build_array(p_room_preference)
                ELSE v_existing_room_prefs
            END,
            dietary_preferences = CASE 
                WHEN p_dietary_preference IS NOT NULL AND NOT (v_existing_diet_prefs ? p_dietary_preference)
                THEN v_existing_diet_prefs || jsonb_build_array(p_dietary_preference)
                ELSE v_existing_diet_prefs
            END,
            updated_at = NOW()
        WHERE id = v_guest_id;
    ELSE
        -- Insert new guest record
        INSERT INTO public.guests (
            hotel_id,
            full_name,
            email,
            phone,
            room_preferences,
            dietary_preferences,
            special_notes,
            last_contact_channel,
            stay_count,
            created_at,
            updated_at
        ) VALUES (
            p_hotel_id,
            p_full_name,
            p_email,
            p_phone,
            CASE WHEN p_room_preference IS NOT NULL THEN jsonb_build_array(p_room_preference) ELSE '[]'::jsonb END,
            CASE WHEN p_dietary_preference IS NOT NULL THEN jsonb_build_array(p_dietary_preference) ELSE '[]'::jsonb END,
            p_special_notes,
            p_channel,
            1,
            NOW(),
            NOW()
        )
        RETURNING id INTO v_guest_id;
    END IF;

    RETURN v_guest_id;
END;
$$;

-- ─────────────────────────────────────────────────────────────────
-- STEP 8: ROW LEVEL SECURITY (RLS) POLICIES FOR GUESTS TABLE
-- ─────────────────────────────────────────────────────────────────
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "hotel_staff_view_guests" ON public.guests;
CREATE POLICY "hotel_staff_view_guests" ON public.guests
    FOR SELECT TO authenticated
    USING (hotel_id = get_user_hotel_id() OR get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "hotel_staff_insert_guests" ON public.guests;
CREATE POLICY "hotel_staff_insert_guests" ON public.guests
    FOR INSERT TO authenticated
    WITH CHECK (hotel_id = get_user_hotel_id() OR get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "hotel_staff_update_guests" ON public.guests;
CREATE POLICY "hotel_staff_update_guests" ON public.guests
    FOR UPDATE TO authenticated
    USING (hotel_id = get_user_hotel_id() OR get_user_role() = 'super_admin');

DROP POLICY IF EXISTS "hotel_staff_delete_guests" ON public.guests;
CREATE POLICY "hotel_staff_delete_guests" ON public.guests
    FOR DELETE TO authenticated
    USING (
        (hotel_id = get_user_hotel_id() AND get_user_role() IN ('hotel_manager', 'super_admin'))
    );
