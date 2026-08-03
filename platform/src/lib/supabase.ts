import { createClient } from "@supabase/supabase-js";

// Make sure to add these to your .env file
// Vite requires the VITE_ prefix to expose variables to the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
