'use strict';
const PMSAdapter = require('../adapters/pms-adapter');
const { acquireRoomHold } = require('../redis/client');
const { scheduleFollowUp } = require('../queues/followup-queue');
const leadHandler = require('./lead');

const pms = new PMSAdapter(process.env.PMS_TYPE || 'native', {
  pmsBaseUrl: process.env.PMS_API_BASE_URL,
  internalApiKey: process.env.INTERNAL_API_KEY,
});

const handle = async (session, message, channel, senderId, hotelSlug, lang) => {
  const msg = message.toLowerCase().trim();

  switch (session.stage) {
    case 'start':
    case 'booking_dates': {
      session.stage = 'booking_dates';
      if (!session.data.checkin) {
        const dateMatch = msg.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/g);
        if (dateMatch && dateMatch.length >= 2) {
          session.data.checkin = dateMatch[0];
          session.data.checkout = dateMatch[1];
          session.stage = 'booking_guests';
          return `Got it — ${session.data.checkin} to ${session.data.checkout}. How many guests will be staying?`;
        }
        return "What dates are you looking at? Please share your check-in and check-out dates (e.g. 2026-06-10 to 2026-06-13).";
      }
    }

    case 'booking_guests': {
      const numMatch = msg.match(/\d+/);
      if (numMatch) {
        session.data.guests = parseInt(numMatch[0]);
        const rooms = await pms.checkAvailability({
          check_in: session.data.checkin,
          check_out: session.data.checkout,
          guests: session.data.guests,
        });
        if (!rooms || rooms.length === 0) {
          return "I'm sorry, we don't have availability for those dates. Would you like to try different dates?";
        }
        session.data.availableRooms = rooms;
        session.stage = 'booking_room_select';
        const roomList = rooms.map((r, i) => `${i + 1}. ${r.type} — £${r.rate}/night (sleeps ${r.capacity}). ${r.description}`).join('\n');
        return `Here are our available rooms:\n\n${roomList}\n\nWhich room would you like? Just reply with the number.`;
      }
      return "How many guests will be staying? (e.g. 2)";
    }

    case 'booking_room_select': {
      const choice = parseInt(msg) - 1;
      if (choice >= 0 && session.data.availableRooms && choice < session.data.availableRooms.length) {
        session.data.selectedRoom = session.data.availableRooms[choice];
        session.stage = 'booking_collect_name';
        return `Great choice! The ${session.data.selectedRoom.type} room it is. May I get your full name to hold the reservation?`;
      }
      return "Please reply with the number of your preferred room.";
    }

    case 'booking_collect_name': {
      if (msg.length > 2) {
        session.data.guestName = message.trim();
        session.stage = 'booking_collect_email';
        return `Thanks ${session.data.guestName}! And your email address?`;
      }
      return "Could you share your full name please?";
    }

    case 'booking_collect_email': {
      if (msg.includes('@')) {
        session.data.email = message.trim();
        session.stage = 'booking_collect_phone';
        return "Perfect! And your phone number? (You can skip this by typing 'skip')";
      }
      return "Please share a valid email address.";
    }

    case 'booking_collect_phone': {
      session.data.phone = msg === 'skip' ? null : message.trim();

      // Acquire Redis room hold — 15 min soft lock
      const bookingRef = `BK-${Date.now()}`;
      const held = await acquireRoomHold(session.data.selectedRoom.id, bookingRef, parseInt(process.env.ROOM_HOLD_TTL_MINUTES || '15'));
      if (!held) {
        session.stage = 'booking_room_select';
        return "I'm sorry — that room was just taken by another guest. Here are the remaining options:\n\n" +
          session.data.availableRooms.map((r, i) => `${i + 1}. ${r.type} — £${r.rate}/night`).join('\n');
      }

      // Create booking in PMS
      const booking = await pms.createBooking({
        name: session.data.guestName,
        email: session.data.email,
        phone: session.data.phone,
        check_in: session.data.checkin,
        check_out: session.data.checkout,
        guests: session.data.guests,
        room_id: session.data.selectedRoom.id,
        booking_ref: bookingRef,
      });

      session.data.bookingId = booking.booking_id;
      session.data.bookingRef = bookingRef;
      session.stage = 'booking_payment';

      // Schedule follow-up (cancelled if payment completes)
      await scheduleFollowUp(senderId, channel, senderId, parseInt(process.env.FOLLOW_UP_DELAY_MINUTES || '60'));

      // Save lead
      await leadHandler.saveLead({
        session_id: senderId,
        hotel_slug: hotelSlug,
        name: session.data.guestName,
        email: session.data.email,
        phone: session.data.phone,
        checkin: session.data.checkin,
        checkout: session.data.checkout,
        channel: channel,
      });

      return `Your ${session.data.selectedRoom.type} room is held for 15 minutes.\n\nBooking Reference: ${bookingRef}\n\nPlease complete payment here to confirm your reservation:\n${booking.payment_link || process.env.HOTEL_BOOKING_URL}\n\nTotal: £${booking.total}`;
    }

    default:
      session.stage = 'start';
      return "Let's start over — what dates are you looking at?";
  }
};

module.exports = { handle };
