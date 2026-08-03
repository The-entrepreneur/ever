import { createClient } from "@supabase/supabase-js";

// Make sure to add these to your .env file
// Vite requires the VITE_ prefix to expose variables to the browser
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
