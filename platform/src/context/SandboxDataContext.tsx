import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SandboxLead {
  id: string; name: string; email: string | null; phone: string | null;
  created_at: string; status: string; lead_quality: number;
  check_in?: string; check_out?: string; guests?: number;
  purpose?: string; channel?: string;
}

export interface SandboxBooking {
  id: string; hotel_id: string; booking_reference: string;
  guest_name: string; room_type: string; check_in: string;
  check_out: string; total_amount: number; status: string; created_at: string;
}

export interface SandboxOrder {
  id: string; hotel_id: string; session_id: string; room_number: string;
  items: { name: string; qty: number }[]; total_amount: number;
  status: string; channel: string; created_at: string;
}

export interface SandboxConversation {
  session_id: string; hotel_id: string; last_message_at: string;
  last_message: string; channel: string; guest_name: string | null;
  guest_phone: string | null; guest_email: string | null;
  handoff_status: string | null; agent_id: string | null;
}

export interface SandboxMessage {
  id: string; session_id: string; client_id: string;
  hotel_slug: string | null; channel: string;
  role: "user" | "assistant" | "agent"; content: string; created_at: string;
}

export interface SandboxFAQ {
  id: string; question: string; answer: string; category: string; active: boolean;
}

export interface SandboxRoom {
  id: string; room_id: string; type: string; rate: number; capacity: number;
  description: string; amenities: string[]; available: boolean;
}

export interface SandboxUpsell {
  id: string; name: string; description: string; price: number;
  category: string; active: boolean; conversion_count: number;
}

export interface SandboxAnalyticsDay {
  date: string; agentVolume: number; staffVolume: number; totalVolume: number;
  faqIntent: number; bookingIntent: number; handoffIntent: number;
  orderIntent: number; handoffRate: number; feedbackScore: number;
  bookedCount: number; bookingValue: number;
}

export interface SandboxData {
  leads: SandboxLead[];
  bookings: SandboxBooking[];
  orders: SandboxOrder[];
  conversations: SandboxConversation[];
  messages: Record<string, SandboxMessage[]>;
  faqs: SandboxFAQ[];
  rooms: SandboxRoom[];
  upsells: SandboxUpsell[];
  analyticsData: SandboxAnalyticsDay[];
}

interface SandboxContextType {
  isSandbox: boolean;
  data: SandboxData | null;
  regenerate: () => void;
}

const SandboxContext = createContext<SandboxContextType>({
  isSandbox: false, data: null, regenerate: () => {},
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const SANDBOX_EMAILS = ["dero@ever.com", "demo@ever.com", "test@ever.com"];
const SESSION_KEY = "ever_sandbox_data_v2";

function uid() { return crypto.randomUUID(); }
function rInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function rFloat(min: number, max: number, dp = 1) { return parseFloat((Math.random() * (max - min) + min).toFixed(dp)); }
function sample<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function rDate(daysBack: number): string {
  const ms = Date.now() - rInt(0, daysBack) * 86400000;
  return new Date(ms).toISOString();
}
function offsetDate(from: Date, days: number): string {
  const d = new Date(from); d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

// ─── Static Reference Data ────────────────────────────────────────────────────
const FIRST_NAMES = [
  "James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda",
  "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph",
  "Jessica", "Thomas", "Sarah", "Charles", "Karen", "Mark", "Lisa", "Daniel",
  "Nancy", "Paul", "Betty", "Andrew", "Margaret", "Joshua", "Sandra",
  "Kenneth", "Ashley", "Kevin", "Dorothy", "Brian", "Kimberly", "George",
  "Emily", "Edward", "Donna", "Ronald", "Michelle", "Timothy", "Carol",
  "Jason", "Amanda", "Jeffrey", "Melissa", "Ryan", "Deborah"
];
const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller",
  "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez",
  "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark",
  "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King",
  "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green",
  "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
  "Carter", "Roberts"
];
const ROOM_TYPES = [
  "Standard King", "Standard Twin", "Deluxe Ocean View", "Family Suite",
  "Presidential Suite", "Deluxe Garden View", "Double Queen",
  "Junior Suite", "Penthouse", "Accessible Room"
];
const CHANNELS = ["whatsapp", "widget", "instagram", "facebook"];
const PURPOSES = ["Business", "Leisure", "Honeymoon", "Family Vacation", "Conference", "Anniversary", "Medical"];
const ORDER_ITEMS = [
  "Club Sandwich", "Caesar Salad", "Wagyu Burger", "Pasta Carbonara",
  "Chocolate Fondant", "Extra Towels", "Mini Bar Restock", "Wine Bottle (Red)",
  "Room Cleaning", "Ironing Service", "Coffee & Croissant", "Airport Transfer",
  "Yoga Mat Delivery", "Pillow Menu Selection", "Champagne & Strawberries",
  "Fruit Basket", "Bottled Water x6", "Late Checkout Arrangement"
];
const GUEST_MESSAGES = [
  "Hi, I need help with my booking confirmation.",
  "Can I order room service to room 304?",
  "What time is the pool open until?",
  "Is breakfast included in my package?",
  "I'd like to extend my stay by one more night.",
  "Can you arrange an airport pickup for tomorrow at 6am?",
  "Do you have a spa? I'd like to book a massage.",
  "My AC doesn't seem to be working properly.",
  "Can I get extra pillows sent to my room?",
  "What is your cancellation policy?",
  "Is there parking available for guests?",
  "We'd like to arrange a surprise birthday setup.",
  "Can you recommend a good local restaurant?",
  "I left my charger in my previous room, has it been found?",
  "Is there a gym on the premises?",
];
const AGENT_REPLIES = [
  "Of course! I'd be happy to help with that. Could you please provide your booking reference?",
  "Absolutely! I've flagged this for our team and they'll attend to it shortly.",
  "Great news — that's available! Shall I go ahead and arrange it for you?",
  "I completely understand. Let me check that for you right away.",
  "Thank you for reaching out! I'll have that sorted within the next few minutes.",
  "I've noted your request and a team member will be with you shortly.",
  "Of course! Your comfort is our top priority. We'll take care of that now.",
  "I can see your booking details. Let me look into this for you.",
];
const HANDOFF_STATUSES: (string | null)[] = [null, null, null, "open", "active", "resolved"];

// ─── Generator ────────────────────────────────────────────────────────────────
function generateSandboxData(hotelId: string): SandboxData {
  const now = new Date();

  // ── 1. FAQs (12) ──────────────────────────────────────────────────────────
  const faqs: SandboxFAQ[] = [
    { id: uid(), question: "What time is check-in and check-out?", answer: "Check-in is from 3:00 PM and check-out is by 11:00 AM. Early check-in and late check-out may be available upon request, subject to availability.", category: "General", active: true },
    { id: uid(), question: "Is breakfast included in the room rate?", answer: "Our bed & breakfast packages include a complimentary continental or buffet breakfast. Room-only rates do not include breakfast, but it can be added for $35 per person.", category: "Dining", active: true },
    { id: uid(), question: "Do you have parking facilities?", answer: "Yes, we offer both self-parking and valet parking. Self-parking is complimentary for hotel guests, and valet parking is available for $25 per day.", category: "Facilities", active: true },
    { id: uid(), question: "Is there a swimming pool?", answer: "Yes, we have an outdoor infinity pool open daily from 7:00 AM to 9:00 PM. Pool towels are provided complimentary at the poolside.", category: "Facilities", active: true },
    { id: uid(), question: "Do you offer airport shuttle service?", answer: "Yes, we provide a complimentary airport shuttle service. Please contact the front desk at least 24 hours in advance to schedule your pickup.", category: "Transport", active: true },
    { id: uid(), question: "What is your cancellation policy?", answer: "Free cancellation up to 48 hours before check-in. Cancellations within 48 hours will incur a charge equal to one night's stay.", category: "Policies", active: true },
    { id: uid(), question: "Do you allow pets?", answer: "We welcome small pets (under 10kg) in select pet-friendly rooms for an additional cleaning fee of $50 per stay. Service animals are always welcome at no extra charge.", category: "Policies", active: true },
    { id: uid(), question: "Is there a gym or fitness centre?", answer: "Yes, our fully equipped fitness centre is open 24/7 for hotel guests. We also offer complimentary yoga mats upon request.", category: "Facilities", active: true },
    { id: uid(), question: "Do you have conference or meeting rooms?", answer: "We have three meeting rooms accommodating 10 to 80 people, equipped with projectors, whiteboards, and high-speed Wi-Fi.", category: "Events", active: true },
    { id: uid(), question: "What dining options are available?", answer: "We have a signature restaurant (open for lunch and dinner), a rooftop bar, 24-hour room service, and a poolside café.", category: "Dining", active: true },
    { id: uid(), question: "Is Wi-Fi free?", answer: "Yes, high-speed Wi-Fi is complimentary throughout the hotel, including all guest rooms, lobby, and common areas.", category: "General", active: true },
    { id: uid(), question: "Do you offer laundry services?", answer: "Yes, same-day laundry and dry cleaning services are available. Items collected before 9:00 AM will be returned by 6:00 PM the same day.", category: "Services", active: true },
  ];

  // ── 2. Rooms (7) ──────────────────────────────────────────────────────────
  const rooms: SandboxRoom[] = [
    { id: uid(), room_id: "STD-K", type: "Standard King", rate: 150, capacity: 2, description: "A comfortable room featuring a king-size bed, work desk, 42\" smart TV, and city views.", amenities: ["King Bed", "Smart TV", "Mini Fridge", "Work Desk", "Free Wi-Fi", "Air Conditioning"], available: true },
    { id: uid(), room_id: "STD-T", type: "Standard Twin", rate: 140, capacity: 2, description: "Twin room with two single beds, ideal for friends or colleagues travelling together.", amenities: ["Twin Beds", "Smart TV", "Mini Fridge", "Work Desk", "Free Wi-Fi", "Air Conditioning"], available: true },
    { id: uid(), room_id: "DLX-OV", type: "Deluxe Ocean View", rate: 280, capacity: 2, description: "Spacious deluxe room with floor-to-ceiling windows offering stunning ocean panoramas.", amenities: ["King Bed", "Ocean View", "Bathtub", "Nespresso Machine", "Smart TV", "Balcony", "Premium Toiletries"], available: true },
    { id: uid(), room_id: "FAM-S", type: "Family Suite", rate: 350, capacity: 4, description: "Generous two-room suite with a master bedroom and a kids' room. Includes a living area and kitchenette.", amenities: ["King Bed", "Bunk Beds", "Kitchenette", "Living Area", "2 Smart TVs", "Board Games", "Sofa Bed"], available: true },
    { id: uid(), room_id: "PRES", type: "Presidential Suite", rate: 850, capacity: 4, description: "Our flagship suite spanning 120sqm with a separate living room, dining area, and a private terrace.", amenities: ["King Bed", "Living Room", "Dining Room", "Private Terrace", "Jacuzzi", "Butler Service", "Premium Bar"], available: true },
    { id: uid(), room_id: "DLX-GV", type: "Deluxe Garden View", rate: 220, capacity: 2, description: "Elegantly appointed room overlooking the lush hotel gardens. Features rain shower and premium bedding.", amenities: ["King Bed", "Garden View", "Rain Shower", "Nespresso Machine", "Smart TV", "Balcony"], available: true },
    { id: uid(), room_id: "DBL-Q", type: "Double Queen", rate: 200, capacity: 4, description: "Comfortable room with two queen-size beds, ideal for families or groups needing extra space.", amenities: ["2 Queen Beds", "Smart TV", "Mini Fridge", "Work Desk", "Free Wi-Fi", "Air Conditioning"], available: false },
  ];

  // ── 3. Upsells (8) ────────────────────────────────────────────────────────
  const upsells: SandboxUpsell[] = [
    { id: uid(), name: "Romantic Turndown Package", description: "Rose petals, champagne, chocolates, and candlelight arranged in your room before arrival.", price: 120, category: "Romance", active: true, conversion_count: rInt(12, 45) },
    { id: uid(), name: "Airport Transfer (Return)", description: "Private sedan transfer to and from the airport. Driver meets you at arrivals with a name sign.", price: 85, category: "Transport", active: true, conversion_count: rInt(30, 80) },
    { id: uid(), name: "Late Check-out (until 4 PM)", description: "Extend your stay until 4:00 PM on checkout day. Subject to availability.", price: 50, category: "Stay", active: true, conversion_count: rInt(40, 110) },
    { id: uid(), name: "Spa Day Pass", description: "Full-day access to the spa facilities including sauna, steam room, and a 30-minute massage.", price: 150, category: "Wellness", active: true, conversion_count: rInt(8, 30) },
    { id: uid(), name: "Breakfast in Bed", description: "Continental or full English breakfast delivered to your room at your chosen time.", price: 35, category: "Dining", active: true, conversion_count: rInt(20, 60) },
    { id: uid(), name: "Welcome Fruit Basket", description: "A curated basket of fresh seasonal fruits and artisanal snacks placed in your room.", price: 28, category: "Amenities", active: true, conversion_count: rInt(15, 50) },
    { id: uid(), name: "City Tour (Half Day)", description: "Guided half-day tour of top attractions with private transport and a local guide.", price: 95, category: "Experiences", active: true, conversion_count: rInt(5, 20) },
    { id: uid(), name: "Premium Wi-Fi Upgrade", description: "Upgrade to 100Mbps dedicated connection for streaming and video calls.", price: 15, category: "Technology", active: false, conversion_count: rInt(2, 10) },
  ];

  // ── 4. Leads (50) ─────────────────────────────────────────────────────────
  const STATUSES = ["captured", "captured", "contacted", "booked", "lost"];
  const leads: SandboxLead[] = Array.from({ length: 50 }, () => {
    const fName = sample(FIRST_NAMES);
    const lName = sample(LAST_NAMES);
    const checkInDate = new Date(now.getTime() + rInt(1, 60) * 86400000);
    return {
      id: uid(),
      name: `${fName} ${lName}`,
      email: `${fName.toLowerCase()}.${lName.toLowerCase()}${rInt(1, 99)}@${sample(["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com"])}`,
      phone: `+${rInt(1, 44)}${rInt(100000000, 999999999)}`,
      created_at: rDate(90),
      status: sample(STATUSES),
      lead_quality: rInt(1, 5),
      check_in: offsetDate(checkInDate, 0),
      check_out: offsetDate(checkInDate, rInt(1, 10)),
      guests: rInt(1, 4),
      purpose: sample(PURPOSES),
      channel: sample(CHANNELS),
    };
  });

  // ── 5. Bookings (40) ──────────────────────────────────────────────────────
  const BOOKING_STATUSES = ["Confirmed", "Confirmed", "Confirmed", "Pending", "Cancelled"];
  const bookings: SandboxBooking[] = Array.from({ length: 40 }, (_, i) => {
    const offsetDays = rInt(-45, 60);
    const checkIn = new Date(now); checkIn.setDate(now.getDate() + offsetDays);
    const nights = rInt(1, 8);
    const checkOut = new Date(checkIn); checkOut.setDate(checkIn.getDate() + nights);
    const roomType = sample(ROOM_TYPES);
    const rateMap: Record<string, number> = {
      "Standard King": 150, "Standard Twin": 140, "Deluxe Ocean View": 280,
      "Family Suite": 350, "Presidential Suite": 850, "Deluxe Garden View": 220,
      "Double Queen": 200, "Junior Suite": 320, "Penthouse": 650, "Accessible Room": 130,
    };
    const nightly = rateMap[roomType] ?? 200;
    return {
      id: uid(),
      hotel_id: hotelId,
      booking_reference: `BK-${10000 + i * 37 + rInt(0, 99)}`,
      guest_name: `${sample(FIRST_NAMES)} ${sample(LAST_NAMES)}`,
      room_type: roomType,
      check_in: checkIn.toISOString().split("T")[0],
      check_out: checkOut.toISOString().split("T")[0],
      total_amount: nightly * nights,
      status: sample(BOOKING_STATUSES),
      created_at: rDate(90),
    };
  });

  // ── 6. Orders (60) ────────────────────────────────────────────────────────
  const ORDER_STATUSES = ["Pending", "Preparing", "Completed", "Completed", "Completed"];
  const orders: SandboxOrder[] = Array.from({ length: 60 }, () => ({
    id: uid(),
    hotel_id: hotelId,
    session_id: `ORD-${uid().slice(0, 8).toUpperCase()}`,
    room_number: `${rInt(1, 8)}0${rInt(1, 9)}`,
    items: Array.from({ length: rInt(1, 3) }, () => ({ name: sample(ORDER_ITEMS), qty: rInt(1, 3) })),
    total_amount: rInt(15, 180),
    status: sample(ORDER_STATUSES),
    channel: sample(CHANNELS),
    created_at: rDate(7),
  }));

  // ── 7. Conversations + Messages (20 sessions) ─────────────────────────────
  const conversations: SandboxConversation[] = [];
  const messagesMap: Record<string, SandboxMessage[]> = {};

  for (let i = 0; i < 20; i++) {
    const sessionId = `sess_${uid().replace(/-/g, "").slice(0, 16)}`;
    const channel = sample(CHANNELS);
    const fName = sample(FIRST_NAMES);
    const lName = sample(LAST_NAMES);
    const guestName = `${fName} ${lName}`;
    const guestEmail = `${fName.toLowerCase()}${rInt(1, 99)}@${sample(["gmail.com", "yahoo.com", "outlook.com"])}`;
    const guestPhone = `+${rInt(1, 44)}${rInt(100000000, 999999999)}`;
    const handoffStatus = sample(HANDOFF_STATUSES);
    const sessionStart = new Date(now.getTime() - rInt(1, 72) * 3600000);

    const msgs: SandboxMessage[] = [];
    const turnCount = rInt(2, 6);
    for (let t = 0; t < turnCount; t++) {
      msgs.push({
        id: uid(), session_id: sessionId, client_id: hotelId, hotel_slug: null, channel,
        role: "user", content: sample(GUEST_MESSAGES),
        created_at: new Date(sessionStart.getTime() + t * 120000).toISOString(),
      });
      msgs.push({
        id: uid(), session_id: sessionId, client_id: hotelId, hotel_slug: null, channel,
        role: handoffStatus === "active" && t === turnCount - 1 ? "agent" : "assistant",
        content: sample(AGENT_REPLIES),
        created_at: new Date(sessionStart.getTime() + t * 120000 + 30000).toISOString(),
      });
    }

    const lastMsg = msgs[msgs.length - 1];
    conversations.push({
      session_id: sessionId, hotel_id: hotelId,
      last_message_at: lastMsg.created_at,
      last_message: lastMsg.content.slice(0, 80),
      channel, guest_name: guestName, guest_phone: guestPhone, guest_email: guestEmail,
      handoff_status: handoffStatus, agent_id: handoffStatus === "active" ? "agent-001" : null,
    });
    messagesMap[sessionId] = msgs;
  }

  conversations.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

  // ── 8. Analytics (90 days timeseries) ─────────────────────────────────────
  let baseVolume = 120;
  const analyticsData: SandboxAnalyticsDay[] = Array.from({ length: 90 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (89 - i));
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    baseVolume = Math.max(60, Math.min(400, baseVolume + rFloat(-20, 25, 1)));
    const agentVol = Math.floor(baseVolume * rFloat(0.75, 0.92, 2));
    const staffVol = Math.floor(baseVolume - agentVol);
    const handoffRate = parseFloat(((staffVol / baseVolume) * 100).toFixed(1));
    const enquired = Math.floor(baseVolume * rFloat(0.35, 0.5, 2));
    const booked = Math.floor(enquired * rFloat(0.12, 0.22, 2));
    const roomRate = rFloat(180, 350, 2);
    return {
      date: dateStr, agentVolume: agentVol, staffVolume: staffVol,
      totalVolume: Math.floor(baseVolume),
      faqIntent: Math.floor(baseVolume * rFloat(0.45, 0.6, 2)),
      bookingIntent: Math.floor(baseVolume * rFloat(0.25, 0.38, 2)),
      handoffIntent: staffVol,
      orderIntent: Math.floor(baseVolume * rFloat(0.08, 0.15, 2)),
      handoffRate, feedbackScore: rFloat(3.8, 5.0, 1),
      bookedCount: booked, bookingValue: parseFloat((booked * roomRate).toFixed(2)),
    };
  });

  return { leads, bookings, orders, conversations, messages: messagesMap, faqs, rooms, upsells, analyticsData };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const SandboxDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const isSandbox = Boolean(user?.email && SANDBOX_EMAILS.includes(user.email.toLowerCase()));
  const hotelId = user?.id ?? "sandbox-hotel";

  const [data, setData] = useState<SandboxData | null>(null);

  const generate = useCallback(() => {
    const fresh = generateSandboxData(hotelId);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
    setData(fresh);
  }, [hotelId]);

  useEffect(() => {
    if (!isSandbox) { setData(null); return; }
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      try { setData(JSON.parse(cached)); return; } catch { /* fall through */ }
    }
    generate();
  }, [isSandbox, generate]);

  return (
    <SandboxContext.Provider value={{ isSandbox, data, regenerate: generate }}>
      {children}
    </SandboxContext.Provider>
  );
};

export const useSandbox = () => useContext(SandboxContext);
