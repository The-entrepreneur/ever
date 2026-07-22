import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

dotenv.config();

// Initialize Supabase Client
export const supabaseUrl = process.env.SUPABASE_URL || "";
export const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Initialize Web Push
export const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || "",
  privateKey: process.env.VAPID_PRIVATE_KEY || ""
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  // If not configured, generate them dynamically once on startup
  const generated = webpush.generateVAPIDKeys();
  vapidKeys.publicKey = generated.publicKey;
  vapidKeys.privateKey = generated.privateKey;
  console.log("[Web Push] Dynamically generated VAPID keys for session:", vapidKeys);
}

try {
  webpush.setVapidDetails(
    "mailto:support@ever.ai",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
} catch (err: any) {
  console.error("[Web Push] Initialization failed:", err?.message || err);
}

// Local memory cache for offline/simulation mode
export const localCache = {
  orders: [
    {
      id: "ord-1",
      room_number: "304",
      items: [{ name: "Club Sandwich", price: 15, quantity: 1 }],
      total_amount: 15,
      status: "preparing",
      created_at: new Date().toISOString()
    },
    {
      id: "ord-2",
      room_number: "102",
      items: [{ name: "Heineken Beer", price: 8, quantity: 2 }],
      total_amount: 16,
      status: "delivered",
      created_at: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  serviceRequests: [
    {
      id: "req-1",
      room_number: "205",
      service_type: "housekeeping",
      details: { notes: "Extra towels and pillows" },
      status: "pending",
      created_at: new Date().toISOString()
    },
    {
      id: "req-2",
      room_number: "311",
      service_type: "laundry",
      details: { items: ["Shirt", "Pants"], notes: "Express wash requested" },
      status: "completed",
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ],
  whatsappAccounts: [
    {
      id: "wa-1",
      phone_number: "+1 (555) 123-4567",
      phone_number_id: "10928374829",
      waba_id: "928374928374",
      display_name: "Grand Horizon Hotel",
      status: "connected",
      connected_via: "openbsp_embedded",
      connected_at: new Date().toISOString()
    }
  ],
  pushSubscriptions: [] as any[]
};

let _aiClient: GoogleGenAI | null = null;

export function getAiClient(): GoogleGenAI {
  if (!_aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. AI capabilities will fail or fallback.");
    }
    _aiClient = new GoogleGenAI({
      apiKey: apiKey || "MISSING",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return _aiClient;
}
