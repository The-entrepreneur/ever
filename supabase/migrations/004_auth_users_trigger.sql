-- EVER Platform — Migration: Sync auth.users to public.users
-- ═══════════════════════════════════════════════════════════════════════════

-- Create a function to automatically populate public.users when a user signs up.
-- This also auto-provisions a Sandbox Hotel for specific test accounts.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    new_hotel_id UUID;
    v_hotel_slug VARCHAR;
BEGIN
    -- If the new user is one of our designated Sandbox accounts
    IF new.email IN ('dero@ever.com', 'demo@ever.com', 'test@ever.com') THEN
        
        -- 1. Create a Sandbox Hotel
        INSERT INTO public.hotels (slug, name)
        VALUES (
            'sandbox-' || substr(md5(random()::text), 1, 8), 
            'EVER Sandbox Hotel'
        )
        RETURNING id, slug INTO new_hotel_id, v_hotel_slug;

        -- 2. Create an active Enterprise subscription for the Sandbox Hotel
        INSERT INTO public.subscriptions (hotel_id, hotel_slug, tier, status)
        VALUES (new_hotel_id, v_hotel_slug, 'enterprise', 'active');

        -- 3. Insert the user into public.users, linked to the new Sandbox Hotel as a Manager
        INSERT INTO public.users (id, hotel_id, email, full_name, role, status)
        VALUES (
            new.id, 
            new_hotel_id, 
            new.email, 
            COALESCE(new.raw_user_meta_data->>'full_name', 'Sandbox User'),
            'hotel_manager',
            'active'
        );

        -- 4. Inject the hotel_id and role into auth.users app_metadata so the JWT gets it immediately
        UPDATE auth.users
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || json_build_object('hotel_id', new_hotel_id, 'role', 'hotel_manager')::jsonb
        WHERE id = new.id;
        
    ELSE
        -- For normal users, insert them into public.users. 
        -- They will not be attached to a hotel until they complete the onboarding wizard.
        INSERT INTO public.users (id, email, full_name, role, status)
        VALUES (
            new.id, 
            new.email, 
            new.raw_user_meta_data->>'full_name',
            'hotel_manager',
            'active'
        );
    END IF;
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it already exists, then create it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
