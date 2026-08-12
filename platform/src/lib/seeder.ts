import { supabase } from "./supabase";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateUUID() {
  return crypto.randomUUID();
}

function sample<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FIRST_NAMES = ["James", "Mary", "Robert", "Patricia", "John", "Jennifer", "Michael", "Linda", "David", "Elizabeth", "William", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

export async function seedDemoData(hotelId: string) {
  try {
    // 1. Delete existing demo data for this hotel
    // (Due to cascade rules on hotel_id, deleting the hotel would delete everything, but we don't want to delete the hotel.
    // We will just delete from the tables sequentially.)
    await Promise.all([
      supabase.from('leads').delete().eq('hotel_id', hotelId),
      supabase.from('conversations').delete().eq('client_id', hotelId),
      supabase.from('bookings').delete().eq('hotel_id', hotelId),
      supabase.from('orders').delete().eq('hotel_id', hotelId),
      supabase.from('faqs').delete().eq('hotel_id', hotelId),
      supabase.from('rooms').delete().eq('hotel_id', hotelId),
      supabase.from('upsells').delete().eq('hotel_id', hotelId),
    ]);

    // 2. Insert FAQs, Rooms, Upsells
    const faqs = [
      { hotel_id: hotelId, question: "What time is check-in and check-out?", answer: "Check-in is from 3:00 PM and check-out is by 11:00 AM.", category: "General", active: true },
      { hotel_id: hotelId, question: "Is breakfast included in the room rate?", answer: "Yes, complimentary continental breakfast is included.", category: "Dining", active: true },
      { hotel_id: hotelId, question: "Do you have parking facilities?", answer: "Yes, free self-parking is available for guests.", category: "Facilities", active: true },
    ];
    await supabase.from('faqs').insert(faqs);

    const rooms = [
      { hotel_id: hotelId, room_id: "STD-K", type: "Standard King", rate: 150.00, capacity: 2, description: "Comfortable room with a king bed.", available: true },
      { hotel_id: hotelId, room_id: "DLX-OV", type: "Deluxe Ocean View", rate: 280.00, capacity: 2, description: "Spacious deluxe room with ocean views.", available: true },
    ];
    await supabase.from('rooms').insert(rooms);

    const upsells = [
      { hotel_id: hotelId, name: "Romantic Turndown Package", description: "Rose petals, champagne, chocolates.", price: 120.00, category: "Romance", active: true, conversion_count: randomInt(5, 20) },
      { hotel_id: hotelId, name: "Late Check-out", description: "Extend your stay until 4:00 PM.", price: 50.00, category: "Stay", active: true, conversion_count: randomInt(10, 50) },
    ];
    await supabase.from('upsells').insert(upsells);

    // 3. Insert Leads
    const leads = [];
    const now = new Date();
    for (let i = 0; i < 15; i++) {
      const fName = sample(FIRST_NAMES);
      const lName = sample(LAST_NAMES);
      leads.push({
        hotel_id: hotelId,
        session_id: `ses_${generateUUID().replace(/-/g, '')}`,
        name: `${fName} ${lName}`,
        email: `${fName.toLowerCase()}.${lName.toLowerCase()}${randomInt(1, 99)}@example.com`,
        phone: `+1555${randomInt(1000000, 9999999)}`,
        status: sample(['captured', 'contacted', 'booked', 'lost']),
        lead_quality: randomInt(1, 5),
        created_at: randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now).toISOString(),
      });
    }
    await supabase.from('leads').insert(leads);

    // 4. Insert Bookings
    const bookings = [];
    for (let i = 0; i < 10; i++) {
      const checkIn = randomDate(new Date(), new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000));
      const checkOut = new Date(checkIn.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000);
      bookings.push({
        hotel_id: hotelId,
        booking_reference: `BK-${randomInt(1000, 9999)}`,
        guest_name: `${sample(FIRST_NAMES)} ${sample(LAST_NAMES)}`,
        room_type: sample(["Standard King", "Deluxe Ocean View"]),
        check_in: checkIn.toISOString().split('T')[0],
        check_out: checkOut.toISOString().split('T')[0],
        total_amount: randomInt(150, 1500),
        status: sample(['Confirmed', 'Pending', 'Cancelled']),
        created_at: randomDate(new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), now).toISOString()
      });
    }
    await supabase.from('bookings').insert(bookings);

    // 5. Insert Orders (Room Service / Maintenance)
    const orders = [];
    for (let i = 0; i < 8; i++) {
      orders.push({
        hotel_id: hotelId,
        session_id: `ses_${generateUUID().replace(/-/g, '')}`,
        room_number: `${randomInt(1, 9)}0${randomInt(1, 9)}`,
        items: [{ name: sample(["Burger", "Wine", "Extra Towels", "Pasta"]), qty: randomInt(1, 3) }],
        total_amount: randomInt(15, 120),
        status: sample(['Pending', 'Preparing', 'Completed']),
        channel: sample(['whatsapp', 'website_widget']),
        created_at: randomDate(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), now).toISOString()
      });
    }
    await supabase.from('orders').insert(orders);

    // 6. Insert dummy Conversations for Inbox
    const conversations = [];
    for (let i = 0; i < 3; i++) {
      const sessionId = `ses_${generateUUID().replace(/-/g, '')}`;
      conversations.push({
        session_id: sessionId,
        client_id: hotelId,
        channel: sample(['whatsapp', 'website_widget']),
        role: 'user',
        content: sample(["Hi, I need help with my booking", "Can I order room service?", "What time is checkout?"]),
        created_at: new Date(now.getTime() - 100000).toISOString()
      });
      conversations.push({
        session_id: sessionId,
        client_id: hotelId,
        channel: sample(['whatsapp', 'website_widget']),
        role: 'assistant',
        content: "I'd be happy to help with that! Could you please provide more details?",
        created_at: new Date(now.getTime() - 50000).toISOString()
      });
    }
    await supabase.from('conversations').insert(conversations);

    return { success: true };
  } catch (err: any) {
    console.error("Failed to seed demo data:", err);
    throw err;
  }
}
