import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

dotenv.config();

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// Initialize Web Push
let vapidKeys = {
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
const localCache = {
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

function getAiClient(): GoogleGenAI {
  if (!_aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not set. AI capabilities will fail or fallback.");
    }
    _aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return _aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // VAPID Public Key Endpoint
  app.get("/api/push/vapid-public-key", (req, res) => {
    res.json({ publicKey: vapidKeys.publicKey });
  });

  // Push Subscription Endpoint
  app.post("/api/push/subscribe", (req, res) => {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "Invalid subscription" });
    }
    
    // De-duplicate subscriptions
    const exists = localCache.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
    if (!exists) {
      localCache.pushSubscriptions.push(subscription);
      console.log(`[Web Push] New subscription added. Total: ${localCache.pushSubscriptions.length}`);
    }
    res.status(201).json({ success: true });
  });

  // Trigger Web Push Notification
  app.post("/api/push/send-notification", async (req, res) => {
    const { title, body, icon, data } = req.body;
    
    const payload = JSON.stringify({
      notification: {
        title: title || "Ever Notification",
        body: body || "New update in operating hub.",
        icon: icon || "/icon-192.png",
        data: data || {}
      }
    });

    let successCount = 0;
    let failCount = 0;

    const promises = localCache.pushSubscriptions.map(async (sub, index) => {
      try {
        await webpush.sendNotification(sub, payload);
        successCount++;
      } catch (err: any) {
        console.warn(`[Web Push] Failed to send notification to subscription ${index}:`, err?.message || err);
        failCount++;
        if (err.statusCode === 410 || err.statusCode === 404) {
          localCache.pushSubscriptions.splice(index, 1);
        }
      }
    });

    await Promise.all(promises);
    res.json({ success: true, sent: successCount, failed: failCount });
  });

  // WhatsApp Connect Endpoint
  app.post("/api/channels/whatsapp/connect", async (req, res) => {
    const { phone_number, phone_number_id, waba_id, display_name } = req.body;
    if (!phone_number || !phone_number_id) {
      return res.status(400).json({ error: "phone_number and phone_number_id are required" });
    }

    const newAccount = {
      id: `wa-${Math.floor(Math.random() * 1000)}`,
      phone_number,
      phone_number_id,
      waba_id: waba_id || "waba-mock-id",
      display_name: display_name || "Hotel WhatsApp",
      status: "connected",
      connected_via: "openbsp_embedded",
      connected_at: new Date().toISOString()
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("whatsapp_accounts")
          .upsert({
            phone_number,
            phone_number_id,
            waba_id: newAccount.waba_id,
            display_name: newAccount.display_name,
            status: "connected",
            connected_via: "openbsp_embedded",
            connected_at: newAccount.connected_at
          }, { onConflict: "phone_number_id" })
          .select();
        
        if (error) throw error;
        return res.json({ success: true, account: data?.[0] || newAccount });
      } catch (err: any) {
        console.error("[Supabase WA Connect Error]", err.message);
      }
    }

    // Memory fallback
    const existingIndex = localCache.whatsappAccounts.findIndex(acc => acc.phone_number_id === phone_number_id);
    if (existingIndex >= 0) {
      localCache.whatsappAccounts[existingIndex] = { ...localCache.whatsappAccounts[existingIndex], ...newAccount };
    } else {
      localCache.whatsappAccounts.push(newAccount);
    }

    res.json({ success: true, account: newAccount });
  });

  // WhatsApp Accounts Fetch
  app.get("/api/channels/whatsapp", async (req, res) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("whatsapp_accounts").select("*");
        if (!error && data) return res.json(data);
      } catch (err) {
        console.error(err);
      }
    }
    res.json(localCache.whatsappAccounts);
  });

  // Orders Feed
  app.get("/api/orders", async (req, res) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
        if (!error && data) return res.json(data);
      } catch (err) {
        console.error(err);
      }
    }
    res.json(localCache.orders);
  });

  // Service Requests Feed
  app.get("/api/service-requests", async (req, res) => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("service_requests").select("*").order("created_at", { ascending: false });
        if (!error && data) return res.json(data);
      } catch (err) {
        console.error(err);
      }
    }
    res.json(localCache.serviceRequests);
  });

  // Update Service Request Status
  app.post("/api/service-requests/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("service_requests")
          .update({ status })
          .eq("id", id)
          .select();
        
        if (!error && data?.length) {
          return res.json({ success: true, request: data[0] });
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Memory fallback
    const reqItem = localCache.serviceRequests.find(r => r.id === id);
    if (reqItem) {
      reqItem.status = status;
      return res.json({ success: true, request: reqItem });
    }
    
    res.status(404).json({ error: "Service request not found" });
  });

  // Update Order Status
  app.post("/api/orders/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: "status is required" });
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("orders")
          .update({ status })
          .eq("id", id)
          .select();
        
        if (!error && data?.length) {
          return res.json({ success: true, order: data[0] });
        }
      } catch (err) {
        console.error(err);
      }
    }

    // Memory fallback
    const ordItem = localCache.orders.find(o => o.id === id);
    if (ordItem) {
      ordItem.status = status;
      return res.json({ success: true, order: ordItem });
    }
    
    res.status(404).json({ error: "Order not found" });
  });

  // API Route for Google Calendar Booking Mock
  app.post("/api/calendar/book", (req, res) => {
    const { date, time, name, email } = req.body;
    
    if (!date || !time || !name || !email) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Normally we would use the Google Calendar API client here:
    // const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    // await calendar.events.insert({ ... })

    console.log(`[Google Calendar API] Mock Booked: ${date} at ${time} for ${name} <${email}>`);
    
    res.json({ success: true, message: "Calendar event successfully booked." });
  });

  // API Route for Gemini Chat
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { prompt, history } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "No prompt provided" });
      }

      const systemInstruction = 
        "You are Ellie, the Ever virtual onboarding partner and support architect. " +
        "You help users (hotel managers, hospitality operators, and partners) navigate technical documentation, set up Property Management System (PMS) integrations like Cloudbeds, Mews, and Opera, configure messaging channels like WhatsApp, and understand native payment ledgers.\n\n" +
        "FORMATTING INSTRUCTIONS:\n" +
        "1. ALWAYS structure your output beautifully using paragraphs, bold headers, and clean lists. Avoid long dense chunks of text; separate logical ideas with dual newlines so there is generous breathing space.\n" +
        "2. Use bolding (**bold text**) for key concepts, but do so selectively to keep reading comfortable.\n" +
        "3. NEVER output raw, unformatted pathnames or URLs like '/help-desk', '/privacy', or 'https://ever.ai/help-desk' in the text. Instead, ALWAYS format them as rich, clean Markdown hyperlinks with pure, highlighted friendly titles. For example, write '[Help Desk](/help-desk)' or '[Privacy Policy](/privacy)', never just '/help-desk'. The user must only see the clean highlighted text to click, with no pathnames or brackets visible.\n\n" +
        "Keep your answers extremely friendly, professional, structured, and informative. If they have complex issues, direct them to our [Help Desk](/help-desk).";

      // format contents as required by @google/genai SDK
      // history items must be objects like: { role: 'user'|'model', parts: [{ text: ... }] }
      const contents = history || [];
      contents.push({ role: "user", parts: [{ text: prompt }] });

      let response = null;
      let lastError = null;
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

      for (const modelName of modelsToTry) {
        let attempts = 0;
        const maxAttempts = 3; // Retry up to 3 times per model
        while (attempts < maxAttempts) {
          try {
            const ai = getAiClient();
            response = await ai.models.generateContent({
              model: modelName,
              contents: contents,
              config: {
                systemInstruction: systemInstruction,
              },
            });
            break; // Success! Break out of the retry loop
          } catch (err: any) {
            attempts++;
            lastError = err;
            console.warn(`Attempt ${attempts} failed for model ${modelName}:`, err?.message || err);
            if (attempts < maxAttempts) {
              // Wait 500ms before retrying the same model with linear backoff
              await new Promise(resolve => setTimeout(resolve, attempts * 500));
            }
          }
        }
        if (response) break; // If we succeeded with this model, break the outer loop
      }

      if (response && response.text) {
        res.json({ text: response.text });
      } else {
        // Fallback gracefully without breaking the socket/HTTP layer with 500
        console.error("All Gemini API models failed. Last error:", lastErrorMessage(lastError));
        res.json({
          text: "I'm currently receiving an unusually high volume of assistance requests and experiencing transient delays. Please try typing your question again in a few seconds, or feel free to book a direct appointment on our [Help Desk](/help-desk) for priority human-assisted onboarding and support!"
        });
      }
    } catch (error: any) {
      console.error("Gemini API error in route handler:", error);
      res.json({
        text: "I'm experiencing a temporary service pause right now. Please try your request again in a moment, or visit our [Help Desk](/help-desk) for immediate support!"
      });
    }
  });

  // API Route for Interactive Hotel Demo Sandbox Chat
  app.post("/api/gemini/demo-chat", async (req, res) => {
    try {
      const { prompt, history, level, hotelId, isHumanAgent } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "No prompt provided" });
      }

      const activeLevel = level === 2 || level === "2" ? 2 : 1;
      const activeHotel = hotelId || "grand-horizon";

      // Define hotel profiles
      const hotels: Record<string, { name: string; city: string; address: string; style: string; amenities: string; rooms: string; upsells: string; links: string }> = {
        "grand-horizon": {
          name: "The Grand Horizon Hotel",
          city: "London",
          address: "14 Harbour Lane, London, UK",
          style: "Classic British Luxury & Sophisticated City Comfort",
          amenities: "Heated indoor lap pool open 6AM-10PM, 24/7 panoramic high-tech gym, complimentary high-speed fiber WiFi, and award-winning daily breakfast served from 7:00 AM - 10:00 AM in the Horizon Dining Room.",
          rooms: "- Standard Room: £89/night (Cozy queen bed, rain shower, city view)\n- Deluxe Room: £129/night (King-sized bed, marble bathtub, complimentary minibar)\n- Executive Penthouse Suite: £199/night (Floor-to-ceiling London skyline view, private lounge, butler service)",
          upsells: "- Airport Chauffeur transfer: £25 single-trip\n- Champagne & Strawberries on arrival: £45\n- Full English Breakfast buffet add-on: £15/person/day\n- Royal Spa access pass: £60 per guest",
          links: "Website: https://grandhorizon.com/book, WhatsApp Support: +44 7700 900123"
        },
        "aura-boutique": {
          name: "Aura Beachfront Boutique Resort",
          city: "Bali",
          address: "Jalan Pantai Suluban No. 8, Uluwatu, Bali, Indonesia",
          style: "Eco-Luxury Tropical Oasis & Zen Oceanfront Serenity",
          amenities: "Jungle-fringed infinity pool overlooking the surf open 7AM-9PM, direct private beach cove access, daily organic sunset yoga sessions, and complimentary tropical breakfast buffet from 7:00 AM - 11:00 AM at the open-air Ocean Breeze Café.",
          rooms: "- Garden Villa: $120/night (Open-air tropical rain shower, private terrace, garden sanctuary)\n- Oceanfront Bungalow: $180/night (Unobstructed turquoise ocean waves view, hammock, direct beach stepdown)\n- Private Pool Canopy Villa: $290/night (Raised canopy jungle view, private plunge pool, outdoor sunken stone bathtub)",
          upsells: "- Private airport pickup shuttle: $30\n- Romantic sunset beach candlelit dinner: $75 per couple\n- Sunrise guided Mount Batur volcano trekking adventure: $40/person\n- 90-minute traditional Balinese deep-tissue massage: $50",
          links: "Website: https://aurabaliresort.com/book, WhatsApp Support: +62 811 380 900"
        },
        "alpine-heights": {
          name: "Alpine Heights Lodge",
          city: "Aspen",
          address: "300 Peakside Way, Aspen, Colorado, USA",
          style: "Warm Fireside Mountain Charm & Premium Ski-In/Ski-Out Chalet",
          amenities: "Ski lockers with built-in boot warmers, outdoor therapeutic hot mineral whirlpool open 8AM-11PM, complimentary fireside S'mores and Belgian hot chocolate from 4:00 PM - 6:00 PM at the Great Hearth lounge, and free private village shuttles.",
          rooms: "- Pine Ridge Cozy Room: $140/night (Fireside wood fireplace, queen bed, forest view)\n- Mountain View Studio: $220/night (Panoramic ski-slope views, king bed, full kitchen corner)\n- Ski-In Luxury Cabin: $420/night (Freestanding luxury log cabin, private outdoor cedar hot tub, master suite)",
          upsells: "- Premium all-mountain ski & board rental: $50/day\n- Private 1-on-1 ski/snowboard lesson: $80/hour\n- Gourmet fireside fondue & wine hamper: $65\n- Deep-tissue alpine sports massage therapy: $90",
          links: "Website: https://alpineheightslodge.com/book, WhatsApp Support: +1 970 555 0190"
        }
      };

      const h = hotels[activeHotel] || hotels["grand-horizon"];

      let systemInstruction = "";

      if (isHumanAgent) {
        systemInstruction =
          `You are Sarah, a real human Guest Services Manager at "${h.name}" in ${h.city}.\n\n` +
          `YOUR ROLE AND BEHAVIOR:\n` +
          `- Speak as a highly empathetic, warm, professional human manager. Do NOT sound like an AI robot or mention that you are a language model.\n` +
          `- You have just joined the conversation to personally assist the guest. Acknowledge what they've discussed with Ellie if appropriate, and keep your tone very personal and natural.\n` +
          `- You have full decision-making powers! Feel free to offer special rates, apply discount codes, or suggest custom setups (such as late checkouts, early check-in, or specific room amenities).\n` +
          `- If they have a booking reference, you can look it up in your mind, confirm their details, and provide VIP reassurance.\n` +
          `- Always keep your responses warm, professional, concise, and structured with clean formatting.\n\n` +
          `PROPERTY PROFILE:\n` +
          `- Hotel Name: ${h.name}\n` +
          `- Style: ${h.style}\n` +
          `- Address: ${h.address}\n` +
          `- Amenities: ${h.amenities}\n` +
          `- Rooms & Starting Rates:\n${h.rooms}\n` +
          `- Upsell Items:\n${h.upsells}\n\n` +
          `FORMATTING & STYLE RULES:\n` +
          `- Use double newlines for spacing. Keep paragraphs short and friendly, like real conversational messaging.\n` +
          `- CRITICAL GRAMMAR AND STYLE RULE: You are STRICTLY FORBIDDEN from using em-dashes (—) or double hyphens (--) under any circumstances in your write-ups and conversations. Replace any em-dashes with commas, colons, parentheses, or simple periods. Your write-ups must read completely naturally, fluidly, and be highly converting.`;
      } else if (activeLevel === 1) {
        systemInstruction =
          `You are Ellie, the virtual Guest Concierge Engine (GCE) for "${h.name}" located in ${h.city}.\n\n` +
          `YOUR ROLE AND LIMITS:\n` +
          `- You are a helpful, warm, and professional hotel assistant.\n` +
          `- You can answer FAQs about check-in/out times, address (${h.address}), pool/gym hours, WiFi, parking, breakfast times, and basic amenities. All of this is detailed in the property profile below.\n` +
          `- You can present room types and starting rates.\n` +
          `- IMPORTANT LIMITATION: You operate as the Guest Concierge Engine (GCE). You DO NOT have access to live room availability calendars, you CANNOT make direct bookings inside the chat, you CANNOT handle direct payments, and you cannot customize/sell reservation upgrades.\n` +
          `- If the user asks to book a room, check live availability, make a reservation, add an upgrade, or make a payment, you must politely state:\n` +
          `  "Direct booking, live availability calendars, and smart in-chat payment checkout are premium features of Ever's Hospitality Commerce Agent (HCA). As a GCE virtual assistant, I can collect your desired dates and redirect you to our external reservation portal or WhatsApp line to complete your stay."\n` +
          `- Then, collect their desired check-in/out dates and show them a link to book: '[Book Now Online](https://ever.ai/demo/book)' or '[Chat on WhatsApp](https://ever.ai/demo/whatsapp)'.\n\n` +
          `PROPERTY PROFILE:\n` +
          `- Hotel Name: ${h.name}\n` +
          `- Style: ${h.style}\n` +
          `- Address: ${h.address}\n` +
          `- Amenities: ${h.amenities}\n` +
          `- Rooms & Starting Rates:\n${h.rooms}\n` +
          `- Redirections: ${h.links}\n\n` +
          `FORMATTING & STYLE RULES:\n` +
          `- Always use elegant spacing with double-newlines. Keep bullet points brief.\n` +
          `- NEVER output raw unformatted paths like '/privacy' or '/help-desk'. Always write '[Privacy Policy](/privacy)' or '[Help Desk](/help-desk)'.\n` +
          `- CRITICAL GRAMMAR AND STYLE RULE: You are STRICTLY FORBIDDEN from using em-dashes (—) or double hyphens (--) under any circumstances in your write-ups and conversations. Replace any em-dashes with commas, colons, parentheses, or simple periods. Your write-ups must read completely naturally, fluidly, and be highly converting.`;
      } else {
        systemInstruction =
          `You are Ellie, the virtual Hospitality Commerce Agent (HCA) for "${h.name}" in ${h.city}.\n\n` +
          `YOUR ROLE AND SUPERPOWERS:\n` +
          `- You have full Guest Support Concierge automation plus Conversational Direct Booking and revenue upselling superpowers!\n` +
          `- You can handle guest FAQs about check-in/out times, address (${h.address}), pool/gym hours, WiFi, parking, breakfast times, and basic amenities.\n` +
          `- You CAN check live room availability: always warmly confirm that room types are available for whatever check-in/out dates they desire!\n` +
          `- You CAN guide guests through a direct booking flow directly inside this chat! Follow these exact steps for bookings:\n` +
          `  1. Ask for their desired check-in and check-out dates and guest count if they haven't provided them.\n` +
          `  2. Present the available rooms: \n${h.rooms}\n  and ask which one they prefer.\n` +
          `  3. PROACTIVELY UPSELL: Once they select a room, enthusiastically recommend adding one or two of our custom upgrades to increase booking value! For example, say: "Excellent choice! Would you like to add our luxurious ${h.upsells.split('\n')[0].replace('- ', '')} to make your visit unforgettable?"\n` +
          `  4. Collect their full name and email address to provision the stay.\n` +
          `  5. CONFIRM the booking: Provide them with a mock Booking Reference starting with 'EV-${h.name.split(' ').map(w=>w[0]).join('')}-${Math.floor(Math.random()*90000+10000)}' and present them with a secure Flutterwave checkout link. You MUST format this link exactly like this: '[Secure Flutterwave Pay](https://flutterwave.com/pay/ever-booking?ref=EV-XXX&hotel=${h.name}&room=ROOM_NAME&amount=AMOUNT)'. E.g., 'Fantastic! I have successfully reserved your room. A secure Flutterwave payment checkout link has been generated. Click the link below to pay and instantly secure your booking.'\n\n` +
          `PROPERTY PROFILE:\n` +
          `- Hotel Name: ${h.name}\n` +
          `- Style: ${h.style}\n` +
          `- Address: ${h.address}\n` +
          `- Amenities: ${h.amenities}\n` +
          `- Rooms & Starting Rates:\n${h.rooms}\n` +
          `- Upsell Items:\n${h.upsells}\n\n` +
          `FORMATTING & STYLE RULES:\n` +
          `- Always use elegant spacing with double-newlines. Keep bullet points brief.\n` +
          `- Use bold headers and clean bullet points.\n` +
          `- NEVER output raw unformatted paths like '/privacy' or '/help-desk'. Always write '[Privacy Policy](/privacy)' or '[Help Desk](/help-desk)'.\n` +
          `- CRITICAL GRAMMAR AND STYLE RULE: You are STRICTLY FORBIDDEN from using em-dashes (—) or double hyphens (--) under any circumstances in your write-ups and conversations. Replace any em-dashes with commas, colons, parentheses, or simple periods. Your write-ups must read completely naturally, fluidly, and be highly converting.`;
      }

      // format contents as required by @google/genai SDK
      const contents = history || [];
      contents.push({ role: "user", parts: [{ text: prompt }] });

      let response = null;
      let lastError = null;
      const modelsToTry = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];

      for (const modelName of modelsToTry) {
        let attempts = 0;
        const maxAttempts = 3;
        while (attempts < maxAttempts) {
          try {
            const ai = getAiClient();
            response = await ai.models.generateContent({
              model: modelName,
              contents: contents,
              config: {
                systemInstruction: systemInstruction,
              },
            });
            break;
          } catch (err: any) {
            attempts++;
            lastError = err;
            console.warn(`Attempt ${attempts} failed in demo-chat for model ${modelName}:`, err?.message || err);
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, attempts * 500));
            }
          }
        }
        if (response) break;
      }

      if (response && response.text) {
        // Clean any accidental em-dashes from the API response just in case
        let cleanText = response.text.replace(/—/g, ", ").replace(/--/g, "-");
        res.json({ text: cleanText });
      } else {
        console.warn("All Gemini API models failed in demo-chat. Falling back to high-fidelity local simulation engine.");
        const fallbackText = generateLocalAgentResponse(prompt, isHumanAgent, activeLevel, h);
        res.json({ text: fallbackText });
      }
    } catch (error: any) {
      console.error("Gemini API error in demo-chat route handler:", error);
      res.json({
        text: "I'm experiencing a temporary service pause right now. Please try your request again in a moment, or visit our [Help Desk](/help-desk) for immediate support!"
      });
    }
  });

  // High-fidelity fallback responder in case Gemini API is rate-limited or quota exceeded (429)
  function generateLocalAgentResponse(prompt: string, isHumanAgent: boolean, activeLevel: number, h: any): string {
    const lower = prompt.toLowerCase();
    
    // 1. Check for Booking/Reservation/Payment/Checkout requests
    if (lower.includes("book") || lower.includes("reserve") || lower.includes("pay") || lower.includes("pricing") || lower.includes("rates") || lower.includes("cost") || lower.includes("price") || lower.includes("stay") || lower.includes("room") || lower.includes("availab")) {
      
      let selectedRoom = "";
      let roomPrice = "";
      let cleanPriceNum = "120";

      if (h.name.includes("Horizon")) {
        if (lower.includes("executive") || lower.includes("penthouse") || lower.includes("suite")) {
          selectedRoom = "Executive Penthouse Suite";
          roomPrice = "£199";
          cleanPriceNum = "199";
        } else if (lower.includes("standard")) {
          selectedRoom = "Standard Room";
          roomPrice = "£89";
          cleanPriceNum = "89";
        } else {
          selectedRoom = "Deluxe Room";
          roomPrice = "£129";
          cleanPriceNum = "129";
        }
      } else if (h.name.includes("Aura")) {
        if (lower.includes("garden") || lower.includes("villa")) {
          selectedRoom = "Garden Villa";
          roomPrice = "$120";
          cleanPriceNum = "120";
        } else if (lower.includes("canopy") || lower.includes("pool")) {
          selectedRoom = "Private Pool Canopy Villa";
          roomPrice = "$290";
          cleanPriceNum = "290";
        } else {
          selectedRoom = "Oceanfront Bungalow";
          roomPrice = "$180";
          cleanPriceNum = "180";
        }
      } else { // Alpine Heights
        if (lower.includes("pine") || lower.includes("cozy") || lower.includes("ridge")) {
          selectedRoom = "Pine Ridge Cozy Room";
          roomPrice = "$140";
          cleanPriceNum = "140";
        } else if (lower.includes("ski") || lower.includes("luxury") || lower.includes("cabin")) {
          selectedRoom = "Ski-In Luxury Cabin";
          roomPrice = "$420";
          cleanPriceNum = "420";
        } else {
          selectedRoom = "Mountain View Studio";
          roomPrice = "$220";
          cleanPriceNum = "220";
        }
      }

      const ref = `EV-FLW-${Math.floor(Math.random() * 90000 + 10000)}`;
      const flwUrl = `https://flutterwave.com/pay/ev-${Math.floor(Math.random() * 89999 + 10000)}?amount=${cleanPriceNum}&ref=${ref}&hotel=${encodeURIComponent(h.name.replace(/ /g, "_"))}&room=${encodeURIComponent(selectedRoom.replace(/ /g, "_"))}`;

      if (isHumanAgent) {
        return `Hello again, this is Sarah. I've personally set up your preferred booking option! I can lock in the **${selectedRoom}** at our special direct rate of **${roomPrice}/night**.\n\nTo secure this reservation instantly under our PMS, you can complete the secure payment through Flutterwave using this button:\n\n[Pay via Flutterwave](${flwUrl})\n\nOnce paid, your digital voucher will activate and sync with our system immediately. Let me know if you would like me to add early check-in for you!`;
      }

      if (activeLevel === 1) {
        return `I can definitely help with pricing details for **${h.name}**! Here are our available options:\n\n${h.rooms}\n\nTo lock in your dates and process the booking, please mention your preferred room. Or you can visit our direct [Booking Page](https://flutterwave.com/pay) to check live availability!`;
      } else {
        return `Excellent choice! I have checked our live PMS and the beautiful **${selectedRoom}** is available for your stay. The direct rate is **${roomPrice} per night**.\n\nI have generated a secure checkout link for you. Click below to pay via Flutterwave and confirm your stay instantly:\n\n[Pay via Flutterwave](${flwUrl})\n\nOnce confirmed, I will send your digital door key and check-in pack straight away!`;
      }
    }

    // 2. Amenities, wifi, pool, etc.
    if (lower.includes("amenit") || lower.includes("pool") || lower.includes("gym") || lower.includes("wifi") || lower.includes("breakfast") || lower.includes("cocoa") || lower.includes("food") || lower.includes("dining")) {
      if (isHumanAgent) {
        return `This is Sarah here, Guest Relations Manager. I can verify that ${h.amenities} We also offer extra perks for direct bookings. Let me know if I can help you secure a room today!`;
      }
      return `We are proud to offer incredible amenities at **${h.name}** to ensure a luxurious stay:\n\n${h.amenities}\n\nLet me know if you would like to book a room or check pricing!`;
    }

    // 3. Upsell / Upgrade / Extras
    if (lower.includes("upsell") || lower.includes("add") || lower.includes("upgrade") || lower.includes("champagne") || lower.includes("spa") || lower.includes("massage") || lower.includes("dinner") || lower.includes("lesson") || lower.includes("rent")) {
      if (isHumanAgent) {
        return `As Guest Relations Manager, I love customizing stays for our VIPs! Here are our available upgrades:\n\n${h.upsells}\n\nI can add any of these directly to your folio. What sounds good to you?`;
      }
      return `Absolutely! You can elevate your stay at **${h.name}** with our custom guest add-ons and premium packages:\n\n${h.upsells}\n\nLet me know if you would like me to include any of these upgrades in your direct reservation link!`;
    }

    // 4. Contact / address / phone / location
    if (lower.includes("address") || lower.includes("where") || lower.includes("location") || lower.includes("phone") || lower.includes("contact") || lower.includes("whatsapp")) {
      if (isHumanAgent) {
        return `You can find us at **${h.address}** in ${h.city}. If you need directions or want to book a shuttle, please let me know. I can handle that for you right now!`;
      }
      return `**${h.name}** is elegantly located in beautiful **${h.city}**.\n\n**Physical Address:** ${h.address}\n\nFor direct assistance, you can also reach our team via ${h.links}.`;
    }

    // 5. General greeting / talk
    const nameIntro = isHumanAgent ? "Sarah, your Guest Relations Manager" : "Ellie, your virtual Guest Concierge";
    return `Hello! I'm **${nameIntro}** here at **${h.name}** in ${h.city}.\n\nHow can I make your experience amazing today? I can help you explore room rates, check live amenities, organize custom packages, or complete secure bookings instantly!`;
  }

  function lastErrorMessage(error: any): string {
    if (!error) return "Unknown error";
    if (typeof error === "object") {
      return error.message || JSON.stringify(error);
    }
    return String(error);
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
