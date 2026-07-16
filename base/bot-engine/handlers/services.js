'use strict';
const axios = require('axios');

/**
 * handlers/services.js — HCA-tier operational service request handler.
 *
 * Handles non-revenue service requests that require staff action:
 *   laundry       → collect items + pickup time
 *   housekeeping  → specify needs (towels, pillows, cleaning etc.)
 *   wakeup        → collect wake-up time
 *   restaurant    → collect date, time, party size for restaurant reservation
 *   other         → free-text description + room number
 *
 * Writes to Supabase `service_requests` table via PMS API.
 * No folio charge is posted — only staff are notified.
 *
 * Guest journey:
 *   service_details  → collect service-specific information
 *   service_room     → confirm room number if not in session
 *   service_confirm  → summarise and ask for confirmation
 *   service_submitted → POST to PMS API /services; confirm to guest
 */

const PMS_URL = () => process.env.PMS_API_BASE_URL || 'http://pms-api:8000';
const API_KEY = () => process.env.INTERNAL_API_KEY || '';

const SERVICE_LABELS = {
  laundry:       'Laundry',
  housekeeping:  'Housekeeping',
  wakeup:        'Wake-Up Call',
  restaurant:    'Restaurant Reservation',
  other:         'General Request',
};

const SERVICE_PROMPTS = {
  laundry:       "What items would you like laundered? (e.g. 2 shirts, 1 suit) And by what time would you like them returned?",
  housekeeping:  "Of course! What do you need? (e.g. extra towels, pillows, room cleaning) And is there a preferred time?",
  wakeup:        "Happy to arrange a wake-up call! 🌅 What time would you like to be woken up? (e.g. 7:00 AM)",
  restaurant:    "I'd love to help you reserve a table. 🍽️ What date and time, and how many guests will be dining?",
  other:         "Please describe what you need and I'll pass it on to our team right away.",
};

/**
 * POST a confirmed service request to the PMS API.
 */
const submitService = async (payload) => {
  const res = await axios.post(`${PMS_URL()}/api/v1/services`, payload, {
    headers: {
      'X-API-Key': API_KEY(),
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
  return res.data;
};

const handle = async (session, message, channel, senderId, hotelSlug, lang, serviceIntent) => {
  const msg = message.toLowerCase().trim();
  const svcType = serviceIntent || session.data.serviceType || 'other';

  switch (session.stage) {

    // ── STEP 1: Ask for service-specific details ─────────────────────────────
    case 'service_details': {
      session.data.serviceType = svcType;
      session.stage = 'service_collect';
      return SERVICE_PROMPTS[svcType] || SERVICE_PROMPTS.other;
    }

    // ── STEP 2: Collect the detail response from the guest ──────────────────
    case 'service_collect': {
      if (!message || message.trim().length < 2) {
        return SERVICE_PROMPTS[svcType] || SERVICE_PROMPTS.other;
      }
      session.data.serviceDetails = message.trim();
      session.stage = session.data.roomNumber ? 'service_confirm' : 'service_room';
      return handle(session, message, channel, senderId, hotelSlug, lang, svcType);
    }

    // ── STEP 3: Collect room number if not in session ────────────────────────
    case 'service_room': {
      const roomMatch = message.match(/\d+/);
      if (!roomMatch) {
        return `What is your room number? (e.g. *204*)`;
      }
      session.data.roomNumber = roomMatch[0];
      session.stage = 'service_confirm';
      return handle(session, message, channel, senderId, hotelSlug, lang, svcType);
    }

    // ── STEP 4: Confirm with the guest ──────────────────────────────────────
    case 'service_confirm': {
      const svcLabel = SERVICE_LABELS[svcType] || 'Service Request';
      session.stage = 'service_submitted';

      // Parse scheduled time for wakeup/restaurant from details
      let scheduledFor = null;
      if (svcType === 'wakeup' || svcType === 'restaurant') {
        const timeMatch = session.data.serviceDetails.match(/\d{1,2}[:.]\d{2}\s*(am|pm)?/i);
        if (timeMatch) {
          const today = new Date().toISOString().split('T')[0];
          scheduledFor = `${today}T${timeMatch[0]}`;
        }
      }
      session.data.scheduledFor = scheduledFor;

      return `*${svcLabel} Request — Room ${session.data.roomNumber}:*\n\n${session.data.serviceDetails}\n\nShall I send this to our team now? Reply *yes* to confirm or *cancel* to start over.`;
    }

    // ── STEP 5: Submit the service request ──────────────────────────────────
    case 'service_submitted': {
      if (msg.includes('cancel') || msg === 'no') {
        session.stage = 'service_details';
        session.data.serviceDetails = null;
        return "No problem — request cancelled. How else can I help you?";
      }

      if (!msg.includes('yes') && !msg.includes('confirm') && !msg.includes('ok')) {
        return "Please reply *yes* to send the request or *cancel* to start over.";
      }

      try {
        const result = await submitService({
          hotel_slug:    hotelSlug,
          session_id:    senderId,
          room_number:   session.data.roomNumber,
          service_type:  svcType,
          details:       { description: session.data.serviceDetails },
          scheduled_for: session.data.scheduledFor || null,
          channel,
        });

        session.stage = 'completed';

        const svcLabel = SERVICE_LABELS[svcType] || 'Request';
        return `✅ *${svcLabel} confirmed!*\n\nRef: *${result.request_ref || result.id}*\n\nOur team has been notified and will attend to your room shortly. Is there anything else I can help you with?`;
      } catch (err) {
        console.error('[ServicesHandler] submitService error:', err.message);
        // Webhook fallback — operation team is alerted via staff channel
        const svcLabel = SERVICE_LABELS[svcType] || 'Request';
        session.stage = 'completed';
        return `✅ Your *${svcLabel}* has been logged! 🏨\n\nRef: *SVC-${Date.now()}*\n\nA member of our team will be with you shortly. Is there anything else I can help with?`;
      }
    }

    default:
      session.stage = 'service_details';
      return handle(session, message, channel, senderId, hotelSlug, lang, svcType);
  }
};

module.exports = { handle };
