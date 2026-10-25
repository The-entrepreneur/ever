import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SandboxLead {
  id: string; name: string; email: string | null; phone: string | null;
  created_at: string; status: string; lead_quality: number;
  check_in?: string; check_out?: string; guests?: number;
  purpose?: string; channel?: string;
  vip_tier?: "standard" | "silver" | "gold" | "vip" | "black";
  stay_count?: number;
  total_spend?: number;
  room_preferences?: string[];
  dietary_preferences?: string[];
  special_notes?: string;
}

export interface SandboxBooking {
  id: string; 
  hotel_id: string; 
  booking_reference: string;
  booking_id?: string;
  guest_name: string; 
  room_type: string; 
  check_in: string;
  check_out: string; 
  total_amount: number;
  booking_value?: number;
  fee_percentage?: number;
  fee_amount?: number;
  channel?: "whatsapp" | "widget" | "instagram" | "facebook";
  status: "Confirmed" | "Pending" | "Cancelled" | "Refunded"; 
  payment_status?: "Paid" | "Pending" | "Refunded";
  payment_provider?: "Paystack" | "Stripe" | "Direct / On Arrival";
  payment_ref?: string;
  upsells_purchased?: { name: string; qty: number; price: number }[];
  guest_email?: string;
  guest_phone?: string;
  cancellation_reason?: string;
  refund_reference?: string;
  modification_history?: { timestamp: string; note: string; actor: string }[];
  created_at: string;
}

export interface SandboxServiceRequest {
  id: string;
  hotel_id: string;
  session_id: string;
  room_number: string;
  service_type: string;
  details: { notes?: string; urgency?: "normal" | "urgent" };
  scheduled_for?: string | null;
  status: "pending" | "preparing" | "in_progress" | "completed" | "cancelled";
  channel: string;
  guest_name?: string;
  assigned_staff?: string;
  staff_remarks?: StaffRemark[];
  created_at: string;
}

export interface StaffRemark {
  id: string;
  author: string;
  role?: string;
  content: string;
  created_at: string;
}

export interface SandboxOrder {
  id: string;
  hotel_id: string;
  session_id: string;
  room_number: string;
  guest_name?: string;
  items: { name: string; qty: number; price?: number }[];
  total_amount: number;
  fee_amount?: number;
  status: string;
  channel: string;
  priority?: "normal" | "rush" | "vip";
  payment_method?: string;
  special_instructions?: string;
  staff_remarks?: StaffRemark[];
  created_at: string;
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
  role: "user" | "assistant" | "agent" | "system"; content: string; created_at: string;
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
  date: string;
  displayDate?: string;
  agentVolume: number; staffVolume: number; totalVolume: number;
  faqIntent: number; bookingIntent: number; handoffIntent: number;
  orderIntent: number; handoffRate: number; feedbackScore: number;
  bookedCount: number; bookingValue: number;
  /** 3% Ever agency performance fee on direct booking value */
  feeAmount: number;
}

export interface SandboxFeedback {
  id: string; session_id: string; guest_name: string; rating: number;
  comment: string; channel: string; status: string; created_at: string;
}

export interface SandboxStaff {
  id: string; full_name: string | null; email: string; role: string;
  status: string; receive_handoff_alerts: boolean; last_login?: string | null; created_at?: string;
  department?: "front_desk" | "concierge" | "housekeeping" | "maintenance" | "fnb" | "management";
  shift?: "morning" | "afternoon" | "night" | "flexible";
  duty_status?: "on_duty" | "off_duty" | "break";
  mobile_number?: string;
}

export interface SandboxChannelAccount {
  id: string;
  channel: "whatsapp" | "instagram" | "facebook" | "widget" | "tawkto";
  display_name?: string;
  phone_number?: string;
  phone_number_id?: string;
  waba_id?: string;
  wa_provider?: "openbsp" | "evolution" | "cloud_api";
  verify_token?: string;
  ig_username?: string;
  ig_account_id?: string;
  fb_page_id?: string;
  fb_page_name?: string;
  widget_color?: string;
  widget_position?: "bottom-right" | "bottom-left";
  widget_welcome?: string;
  widget_show_badge?: boolean;
  widget_avatar_url?: string;
  tawk_property_id?: string;
  tawk_widget_id?: string;
  tawk_api_key?: string;
  status: "connected" | "disconnected" | "pending" | "error";
  connected_via?: string;
  connected_at?: string;
  last_tested_at?: string | null;
  strict_validation?: boolean;
}

export interface SandboxDpaRecord {
  id: string; dpa_version: string; signed_by_name: string;
  signed_by_email: string; signed_at: string; document_url: string;
}

export interface SandboxSubProcessor {
  id: string; name: string; purpose: string; region: string; dpa_accepted: boolean;
}

export interface SandboxDsrRequest {
  id: string; guest_email: string; request_type: string;
  status: string; received_at: string; completed_at?: string;
}

export interface SandboxInvoice {
  id: string; date: string; period: string; amount: number; status: "Paid" | "Pending";
}

export interface SandboxTemplateItem {
  id: string;
  name: string;
  language: string;
  category: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  body: string;
}

export interface SandboxAgentSettings {
  agentName: string;
  agentTone: "Formal" | "Friendly" | "Playful" | "Conversational";
  languagePriority: string;
  welcomeMessage: string;
  privacyNoticeUrl: string;
  bookingUrl: string;
  whatsappNumber: string;
  humanOnlyMode: boolean;
  startTime: string;
  endTime: string;
  outOfHoursMessage: string;
  handoffTriggers: string[];
  handoffAlertMethod: "email" | "whatsapp" | "both";
  repEmail: string;
  secondaryAlertEmail: string;
  consentCaptureMode: boolean;
  leadQualityThreshold: number;
  templates: SandboxTemplateItem[];
}

export interface SandboxData {
  leads: SandboxLead[];
  bookings: SandboxBooking[];
  orders: SandboxOrder[];
  serviceRequests?: SandboxServiceRequest[];
  conversations: SandboxConversation[];
  messages: Record<string, SandboxMessage[]>;
  faqs: SandboxFAQ[];
  rooms: SandboxRoom[];
  upsells: SandboxUpsell[];
  analyticsData: SandboxAnalyticsDay[];
  feedback: SandboxFeedback[];
  staff: SandboxStaff[];
  channels: SandboxChannelAccount[];
  dpaRecord: SandboxDpaRecord;
  subProcessors: SandboxSubProcessor[];
  dsrRequests: SandboxDsrRequest[];
  invoices: SandboxInvoice[];
  agentSettings?: SandboxAgentSettings;
}

interface SandboxContextType {
  isSandbox: boolean;
  data: SandboxData | null;
  regenerate: () => void;
  updateData: (updater: (prev: SandboxData) => SandboxData) => void;
}

const SandboxContext = createContext<SandboxContextType>({
  isSandbox: false, data: null, regenerate: () => {}, updateData: () => {},
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

const FEEDBACK_COMMENTS_5 = [
  "Loved the easy booking process through WhatsApp. Very fast and accurate!",
  "Ever AI helped me order late night room service in 30 seconds. Impeccable experience.",
  "Super convenient way to ask for extra towels and get local restaurant tips.",
  "Checking in was instantaneous. The digital concierge answered all our family queries.",
  "Outstanding speed! Felt like talking to a human concierge 24/7."
];
const FEEDBACK_COMMENTS_4 = [
  "Bot was helpful, but I needed to speak to a human staff member for billing.",
  "Great experience overall, very responsive.",
  "Quick response for amenities, minor delay during peak dinner rush.",
  "Very friendly tone and accurate directions to the spa."
];
const FEEDBACK_COMMENTS_3 = [
  "Decent response time. Would love more restaurant recommendations.",
  "Okay experience, worked fine for check-out time questions."
];
const FEEDBACK_COMMENTS_2 = [
  "Room service took longer than estimated. Bot couldn't expedite with kitchen.",
  "Had to repeat my booking reference twice before human handoff."
];

// ─── Generator ────────────────────────────────────────────────────────────────
function generateSandboxData(hotelId: string, hotelName: string = "Dero Apartments & Resorts"): SandboxData {
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
    const stays = rInt(1, 7);
    const vip: "standard" | "silver" | "gold" | "vip" | "black" = 
      stays >= 6 ? "vip" : stays >= 4 ? "gold" : stays >= 2 ? "silver" : "standard";
    const roomPrefs = sample([
      ["High Floor", "Quiet Room"],
      ["Near Elevator", "Feather-free Pillows"],
      ["Ocean View Guarantee", "King Bed"],
      ["Late Checkout Preference", "Extra Towels"],
      ["Ground Floor", "Accessible Access"],
      []
    ]);
    const dietPrefs = sample([
      ["Vegetarian"],
      ["Gluten-free"],
      ["Nut Allergy"],
      ["No Shellfish", "Dairy-free"],
      ["Halal Only"],
      []
    ]);
    const notes = sample([
      "Prefers evening turndown service with chamomile tea.",
      "Celebrates wedding anniversary every October; VIP wine arrangement.",
      "Corporate frequent flyer; always requests digital folio receipts.",
      "Prefers rooms situated far from the ice machine.",
      "Sensitive to feathers; strictly synthetic microfiber pillows only.",
      undefined
    ]);

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
      vip_tier: vip,
      stay_count: stays,
      total_spend: stays * rInt(180, 520),
      room_preferences: roomPrefs,
      dietary_preferences: dietPrefs,
      special_notes: notes,
    };
  });

  // ── 5. Bookings (40) ──────────────────────────────────────────────────────
  const BOOKING_STATUSES: ("Confirmed" | "Pending" | "Cancelled")[] = ["Confirmed", "Confirmed", "Confirmed", "Pending", "Cancelled"];
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
    const totalAmount = nightly * nights;
    const feePercentage = 0.0300;
    const feeAmount = parseFloat((totalAmount * feePercentage).toFixed(2));
    const status = sample(BOOKING_STATUSES);
    const ref = `BK-${10000 + i * 37 + rInt(0, 99)}`;
    const fName = sample(FIRST_NAMES);
    const lName = sample(LAST_NAMES);
    const channel = sample(CHANNELS) as "whatsapp" | "widget" | "instagram" | "facebook";

    const hasUpsell = Math.random() > 0.4;
    const sampleUpsell = sample(upsells);
    const upsellsPurchased = hasUpsell ? [{ name: sampleUpsell.name, qty: 1, price: sampleUpsell.price }] : [];

    return {
      id: uid(),
      hotel_id: hotelId,
      booking_reference: ref,
      booking_id: ref,
      guest_name: `${fName} ${lName}`,
      room_type: roomType,
      check_in: checkIn.toISOString().split("T")[0],
      check_out: checkOut.toISOString().split("T")[0],
      total_amount: totalAmount,
      booking_value: totalAmount,
      fee_percentage: feePercentage,
      fee_amount: feeAmount,
      channel: channel,
      status: status,
      payment_status: status === "Confirmed" ? "Paid" : status === "Cancelled" ? "Refunded" : "Pending",
      payment_provider: sample(["Paystack", "Stripe", "Direct / On Arrival"]) as any,
      payment_ref: `PAY-${uid().slice(0, 8).toUpperCase()}`,
      guest_email: `${fName.toLowerCase()}.${lName.toLowerCase()}${rInt(1, 99)}@gmail.com`,
      guest_phone: `+1 (555) ${rInt(100, 999)}-${rInt(1000, 9999)}`,
      upsells_purchased: upsellsPurchased,
      cancellation_reason: status === "Cancelled" ? sample(["Guest Request", "No-Show", "Double Booking / PMS Conflict"]) : undefined,
      refund_reference: status === "Cancelled" ? `REF-${uid().slice(0, 6).toUpperCase()}` : undefined,
      modification_history: [
        { timestamp: rDate(30), note: "Reservation confirmed via " + channel, actor: "AI Concierge" }
      ],
      created_at: rDate(90),
    };
  });

  // ── 6. Orders (60) & Service Requests (30) ────────────────────────────────
  const ORDER_STATUSES = ["pending", "preparing", "preparing", "delivered", "delivered", "delivered"];
  const orders: SandboxOrder[] = Array.from({ length: 60 }, () => {
    const fName = sample(FIRST_NAMES);
    const lName = sample(LAST_NAMES);
    const orderItems = Array.from({ length: rInt(1, 3) }, () => ({
      name: sample(ORDER_ITEMS),
      qty: rInt(1, 3),
      price: rInt(14, 38)
    }));
    const totalAmt = orderItems.reduce((acc, item) => acc + (item.price || 20) * item.qty, 0);
    const status = sample(ORDER_STATUSES);
    const remarks: StaffRemark[] = [];
    if (status === "preparing" || status === "delivered") {
      remarks.push({
        id: uid(),
        author: sample(["Kitchen Staff (Chef Marco)", "F&B Expeditor", "Front Desk"]),
        role: "kitchen",
        content: status === "delivered" ? "Order prepared, packed, and delivered to room" : "Order acknowledged by kitchen, preparation in progress",
        created_at: rDate(1)
      });
    }
    return {
      id: uid(),
      hotel_id: hotelId,
      session_id: `ORD-${uid().slice(0, 8).toUpperCase()}`,
      room_number: `${rInt(1, 8)}0${rInt(1, 9)}`,
      guest_name: `${fName} ${lName}`,
      items: orderItems,
      total_amount: totalAmt,
      fee_amount: parseFloat((totalAmt * 0.05).toFixed(2)),
      status,
      channel: sample(CHANNELS),
      priority: sample(["normal", "normal", "rush", "vip"]),
      payment_method: sample(["Room Charge (Folio)", "Card on File", "Direct on Delivery"]),
      special_instructions: sample([
        "Extra napkins and condiments please",
        "Please knock twice and leave on dining tray",
        "Dietary note: no shellfish, mild spices",
        "Cutlery for 2 people",
        ""
      ]),
      staff_remarks: remarks,
      created_at: rDate(7),
    };
  });

  const SERVICE_PRESETS = [
    { type: "housekeeping", title: "Housekeeping Refresh", notes: "Full room refresh and fresh towel replenishment requested" },
    { type: "housekeeping", title: "Extra Towels & Linens", notes: "Guest requested 2 extra bath sheets and hypoallergenic pillows" },
    { type: "maintenance",  title: "AC / Temperature Calibration", notes: "Thermostat running cold; requested calibration to 22C" },
    { type: "maintenance",  title: "Plumbing / Hot Water Check", notes: "Shower pressure low, engineering inspection requested" },
    { type: "laundry",      title: "Dry Cleaning & Suit Press", notes: "2 suits and 1 dress for evening express pressing" },
    { type: "laundry",      title: "Luggage Valet Assistance", notes: "Baggage collection assistance for morning departure" },
    { type: "restaurant",   title: "Dinner Table Reservation", notes: "Table for 2 at The Grand Bistro for 8:00 PM" },
    { type: "restaurant",   title: "Private Dining / Wine Pairing", notes: "Chef tasting menu reservation with wine pairing" },
    { type: "wakeup",       title: "Morning Wake-Up Call", notes: "Automated wake-up call scheduled for 6:30 AM" },
    { type: "wakeup",       title: "Airport Transit Wake-Up", notes: "Wake-up call + taxi notification at 5:00 AM" },
  ];

  const serviceRequests: SandboxServiceRequest[] = Array.from({ length: 30 }, () => {
    const fName = sample(FIRST_NAMES);
    const lName = sample(LAST_NAMES);
    const preset = sample(SERVICE_PRESETS);
    const status = sample(["pending", "in_progress", "in_progress", "completed", "completed"]) as any;
    const isUrgent = Math.random() > 0.75;
    const assignedStaff = status === "pending"
      ? (Math.random() > 0.5 ? "Unassigned" : sample(["Elena R. (Housekeeping)", "David K. (Maintenance)"]))
      : sample(["Elena R. (Housekeeping)", "Marcus V. (Guest Services)", "David K. (Maintenance)", "Front Desk"]);
    const remarks: StaffRemark[] = [];
    if (status !== "pending") {
      remarks.push({
        id: uid(),
        author: assignedStaff || "Staff Dispatcher",
        role: preset.type,
        content: status === "completed" ? "Request fulfilled and verified with guest" : "Staff dispatched to room",
        created_at: rDate(1)
      });
    }
    return {
      id: uid(),
      hotel_id: hotelId,
      session_id: `SR-${uid().slice(0, 8).toUpperCase()}`,
      room_number: `${rInt(1, 8)}0${rInt(1, 9)}`,
      guest_name: `${fName} ${lName}`,
      service_type: preset.type,
      details: {
        notes: preset.notes,
        description: preset.title,
        urgency: isUrgent ? "urgent" : "normal"
      },
      scheduled_for: new Date(now.getTime() + rInt(1, 4) * 3600000).toISOString(),
      status,
      channel: sample(CHANNELS),
      assigned_staff: assignedStaff,
      staff_remarks: remarks,
      created_at: rDate(4),
    };
  });

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
    const isoDate = d.toISOString().split("T")[0];
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    baseVolume = Math.max(60, Math.min(400, baseVolume + rFloat(-20, 25, 1)));
    const agentVol = Math.floor(baseVolume * rFloat(0.75, 0.92, 2));
    const staffVol = Math.floor(baseVolume - agentVol);
    const handoffRate = parseFloat(((staffVol / baseVolume) * 100).toFixed(1));
    const enquired = Math.floor(baseVolume * rFloat(0.35, 0.5, 2));
    const booked = Math.floor(enquired * rFloat(0.12, 0.22, 2));
    const roomRate = rFloat(180, 350, 2);
    const dailyBookingValue = parseFloat((booked * roomRate).toFixed(2));
    const dailyFeeAmount = parseFloat((dailyBookingValue * 0.03).toFixed(2));
    return {
      date: isoDate, displayDate: dateStr, agentVolume: agentVol, staffVolume: staffVol,
      totalVolume: Math.floor(baseVolume),
      faqIntent: Math.floor(baseVolume * rFloat(0.45, 0.6, 2)),
      bookingIntent: Math.floor(baseVolume * rFloat(0.25, 0.38, 2)),
      handoffIntent: staffVol,
      orderIntent: Math.floor(baseVolume * rFloat(0.08, 0.15, 2)),
      handoffRate, feedbackScore: rFloat(3.8, 5.0, 1),
      bookedCount: booked, bookingValue: dailyBookingValue, feeAmount: dailyFeeAmount,
    };
  });

  // ── 9. Feedback & Reviews (25) ────────────────────────────────────────────
  const feedback: SandboxFeedback[] = Array.from({ length: 25 }, (_, i) => {
    const ratingWeights = [5, 5, 5, 5, 4, 4, 3, 2, 5, 4];
    const rating = sample(ratingWeights);
    const comment = rating === 5 ? sample(FEEDBACK_COMMENTS_5) :
                    rating === 4 ? sample(FEEDBACK_COMMENTS_4) :
                    rating === 3 ? sample(FEEDBACK_COMMENTS_3) : sample(FEEDBACK_COMMENTS_2);
    return {
      id: uid(),
      session_id: `sess_${uid().replace(/-/g, "").slice(0, 12)}`,
      guest_name: `${sample(FIRST_NAMES)} ${sample(LAST_NAMES)}`,
      rating,
      comment,
      channel: sample(CHANNELS),
      status: "rated",
      created_at: rDate(30),
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // ── 10. Staff Roster (4) ──────────────────────────────────────────────────
  const staff: SandboxStaff[] = [
    { id: uid(), full_name: "Alex Mercer", email: "alex@ever.com", role: "hotel_manager", status: "active", receive_handoff_alerts: true, last_login: new Date().toISOString(), created_at: rDate(120), department: "management", shift: "flexible", duty_status: "on_duty", mobile_number: "+1 (555) 234-8901" },
    { id: uid(), full_name: "Elena Rostova", email: "elena.r@ever.com", role: "hotel_receptionist", status: "active", receive_handoff_alerts: true, last_login: rDate(1), created_at: rDate(90), department: "front_desk", shift: "morning", duty_status: "on_duty", mobile_number: "+1 (555) 345-6789" },
    { id: uid(), full_name: "Carlos Mendez", email: "carlos.m@ever.com", role: "hotel_receptionist", status: "active", receive_handoff_alerts: true, last_login: rDate(2), created_at: rDate(60), department: "concierge", shift: "afternoon", duty_status: "break", mobile_number: "+1 (555) 456-7890" },
    { id: uid(), full_name: "Sarah Jenkins", email: "sarah.j@ever.com", role: "hotel_readonly", status: "active", receive_handoff_alerts: false, last_login: rDate(5), created_at: rDate(45), department: "fnb", shift: "flexible", duty_status: "off_duty", mobile_number: "+1 (555) 567-8901" },
  ];

  // ── 11. Channels (All 5 channels supported per Screen 7) ───────────────────
  const channels: SandboxChannelAccount[] = [
    {
      id: uid(),
      channel: "whatsapp",
      display_name: hotelName,
      phone_number: "+1 (555) 382-9102",
      phone_number_id: "10931893198",
      waba_id: "waba_8491024",
      wa_provider: "openbsp",
      status: "connected",
      connected_via: "openbsp_embedded",
      connected_at: rDate(60),
      last_tested_at: rDate(2),
      strict_validation: false,
    },
    {
      id: uid(),
      channel: "instagram",
      display_name: hotelName,
      ig_username: "@" + hotelName.toLowerCase().replace(/[^a-z0-9]/g, ""),
      ig_account_id: "ig_9273932014",
      status: "connected",
      connected_via: "openbsp_embedded",
      connected_at: rDate(45),
      last_tested_at: rDate(3),
      strict_validation: false,
    },
    {
      id: uid(),
      channel: "facebook",
      display_name: hotelName,
      fb_page_id: "fb_page_10948294820",
      fb_page_name: hotelName + " Official",
      status: "disconnected",
      connected_via: "openbsp_embedded",
      connected_at: undefined,
      last_tested_at: null,
      strict_validation: false,
    },
    {
      id: uid(),
      channel: "widget",
      display_name: hotelName + " Web Widget",
      status: "connected",
      widget_color: "#EA6639",
      widget_position: "bottom-right",
      widget_welcome: `Welcome to ${hotelName}! I'm your digital concierge. How can I assist your stay today?`,
      widget_show_badge: true,
      widget_avatar_url: "",
      connected_at: rDate(90),
      last_tested_at: rDate(1),
      strict_validation: true,
    },
    {
      id: uid(),
      channel: "tawkto",
      display_name: hotelName + " Live Chat",
      status: "disconnected",
      tawk_property_id: "65b92f9a8d261e1b5f59c112",
      tawk_widget_id: "1hk28e932",
      tawk_api_key: "",
      connected_at: undefined,
      last_tested_at: null,
      strict_validation: false,
    }
  ];

  // ── 12. Compliance (DPA, Sub-processors, DSR) ─────────────────────────────
  const dpaRecord: SandboxDpaRecord = {
    id: uid(),
    dpa_version: "v2.4 (2026 GDPR/NDPA)",
    signed_by_name: "Alex Mercer",
    signed_by_email: "alex@ever.com",
    signed_at: rDate(150),
    document_url: "#",
  };

  const subProcessors: SandboxSubProcessor[] = [
    { id: uid(), name: "Supabase Inc.", purpose: "PostgreSQL Database & Auth hosting", region: "EU (Frankfurt)", dpa_accepted: true },
    { id: uid(), name: "Google Cloud / Gemini", purpose: "Natural Language AI generation", region: "Global / US-Central", dpa_accepted: true },
    { id: uid(), name: "Meta Platforms (WhatsApp)", purpose: "WhatsApp Cloud API delivery", region: "Global", dpa_accepted: true },
    { id: uid(), name: "Stripe Inc.", purpose: "Payment tokenization & transactions", region: "US / EU", dpa_accepted: true },
    { id: uid(), name: "Twilio Inc.", purpose: "Carrier SMS failover dispatch", region: "Global", dpa_accepted: true },
  ];

  const dsrRequests: SandboxDsrRequest[] = [
    { id: uid(), guest_email: "marcus.vance@gmail.com", request_type: "Erasure (GDPR Art. 17)", status: "pending", received_at: rDate(3) },
    { id: uid(), guest_email: "claire.dupont@orange.fr", request_type: "Data Export (GDPR Art. 20)", status: "completed", received_at: rDate(14), completed_at: rDate(12) },
  ];

  // ── 13. Invoices ──────────────────────────────────────────────────────────
  const invoices: SandboxInvoice[] = [
    { id: "INV-2026-008", date: "Aug 1, 2026", period: "Jul 1 - Jul 31", amount: 726.50, status: "Paid" },
    { id: "INV-2026-007", date: "Jul 1, 2026", period: "Jun 1 - Jun 30", amount: 654.20, status: "Paid" },
    { id: "INV-2026-006", date: "Jun 1, 2026", period: "May 1 - May 31", amount: 589.00, status: "Paid" },
  ];

  // ── 14. Agent Settings ───────────────────────────────────────────────────
  const agentSettings: SandboxAgentSettings = {
    agentName: "Ever AI Concierge",
    agentTone: "Friendly",
    languagePriority: "Auto-detect",
    welcomeMessage: "Welcome to our property! I'm your digital concierge. How can I assist your stay today?",
    privacyNoticeUrl: "https://ever.ai/privacy",
    bookingUrl: "https://thegrandhorizon.com/book",
    whatsappNumber: "+1 (555) 382-9102",
    humanOnlyMode: false,
    startTime: "00:00",
    endTime: "23:59",
    outOfHoursMessage: "Our digital concierge is currently offline. For urgent assistance, please contact the front desk directly.",
    handoffTriggers: ["complaint", "manager", "refund", "emergency", "human"],
    handoffAlertMethod: "both",
    repEmail: "reception@thegrandhorizon.com",
    secondaryAlertEmail: "manager@thegrandhorizon.com",
    consentCaptureMode: true,
    leadQualityThreshold: 3,
    templates: [
      { id: uid(), name: "booking_confirmation", language: "en_US", category: "UTILITY", status: "APPROVED", body: "Hello {{1}}, your booking at {{2}} has been confirmed for {{3}}." },
      { id: uid(), name: "welcome_message", language: "en_US", category: "MARKETING", status: "APPROVED", body: "Welcome to {{1}}! I'm your digital concierge. How can I assist your stay?" },
      { id: uid(), name: "checkout_reminder", language: "en_US", category: "UTILITY", status: "APPROVED", body: "Dear {{1}}, friendly reminder that check-out is at 11:00 AM. Would you like late check-out?" },
      { id: uid(), name: "spa_special_offer", language: "en_US", category: "MARKETING", status: "PENDING", body: "Exclusive 20% off all spa packages today for our in-house guests. Reply to reserve." }
    ]
  };

  return {
    leads, bookings, orders, serviceRequests, conversations, messages: messagesMap,
    faqs, rooms, upsells, analyticsData, feedback, staff, channels,
    dpaRecord, subProcessors, dsrRequests, invoices, agentSettings
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const SandboxDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const isSandbox = Boolean(user?.email && SANDBOX_EMAILS.includes(user.email.toLowerCase()));
  const hotelId = user?.id ?? "sandbox-hotel";

  const [data, setData] = useState<SandboxData | null>(null);

  const generate = useCallback(() => {
    const hotelName = user?.email?.toLowerCase() === "dero@ever.com"
      ? "Dero Apartments & Resorts"
      : (user?.user_metadata?.hotel_name || user?.user_metadata?.property_name || "Dero Apartments & Resorts");
    const fresh = generateSandboxData(hotelId, hotelName);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
    setData(fresh);
  }, [hotelId, user]);

  const updateData = useCallback((updater: (prev: SandboxData) => SandboxData) => {
    setData(prev => {
      if (!prev) return prev;
      const updated = updater(prev);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  useEffect(() => {
    if (!isSandbox) { setData(null); return; }
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) {
      try { setData(JSON.parse(cached)); return; } catch { /* fall through */ }
    }
    generate();
  }, [isSandbox, generate]);

  return (
    <SandboxContext.Provider value={{ isSandbox, data, regenerate: generate, updateData }}>
      {children}
    </SandboxContext.Provider>
  );
};

export const useSandbox = () => useContext(SandboxContext);
