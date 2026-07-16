'use strict';
const bookingHandler = require('./booking');
const upsellHandler  = require('./upsell');

/**
 * GCE-tier router — routes messages through the booking/upsell stage machine.
 * Returns null for unrecognised intents so n8n's AI agent handles them.
 *
 * @param {object} session  - Current session state (mutated in place)
 * @param {string} message  - Raw guest message text
 * @param {string} channel  - Channel identifier
 * @param {string} senderId - Channel sender ID
 * @param {string} hotelSlug
 * @param {string} lang     - Detected ISO-639 language code
 * @returns {Promise<string|null>}
 */
const route = async (session, message, channel, senderId, hotelSlug, lang) => {
  if (session.stage === 'start') {
    const msg = message.toLowerCase().trim();
    const bookingKeywords = [
      'book', 'reserve', 'room', 'availability', 'stay', 'dates', 'night',
      'rate', 'price', 'checkin', 'checkout', 'check-in', 'check-out',
      'accommodation', 'vacancy', 'vacancies', 'reservation', 'tariff', 'cost',
    ];
    const hasBookingIntent =
      bookingKeywords.some(kw => msg.includes(kw)) ||
      /(\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/.test(msg);

    if (!hasBookingIntent) {
      return null; // No booking intent — bubble up to n8n AI agent
    }
    session.stage = 'booking_dates';
  }

  switch (session.stage) {
    case 'booking_dates':
    case 'booking_guests':
    case 'booking_room_select':
    case 'booking_collect_name':
    case 'booking_collect_email':
    case 'booking_collect_phone':
    case 'booking_confirm':
    case 'booking_payment':
      return bookingHandler.handle(session, message, channel, senderId, hotelSlug, lang);

    case 'upsell_airport':
    case 'upsell_breakfast':
    case 'upsell_extra_bed':
    case 'upsell_romantic':
    case 'upsell_spa':
      return upsellHandler.handle(session, message, channel, senderId, hotelSlug);

    case 'completed':
      return "Your booking is confirmed! Is there anything else I can help you with? 😊";

    default:
      session.stage = 'start';
      return null;
  }
};

/**
 * HCA-tier intent router — extends GCE with ORDER and SERVICE intents.
 *
 * Called by index.js when the HCA n8n workflow's Bot Engine Proxy POSTs
 * a message that includes `order_intent`, `service_intent`, or `booking_intent`
 * flags — parsed from the AI's [ORDER_INTENT:...] and [SERVICE_INTENT:...] tags.
 *
 * Handlers are lazy-required to prevent circular dependency issues.
 *
 * @param {object}      session
 * @param {string}      message
 * @param {string}      channel
 * @param {string}      senderId
 * @param {string}      hotelSlug
 * @param {string}      lang
 * @param {string|null} orderIntent   - e.g. "f&b" | "spa" | "transport"
 * @param {string|null} serviceIntent - e.g. "laundry" | "housekeeping" | "wakeup" | "restaurant"
 * @param {boolean}     bookingIntent
 * @returns {Promise<string|null>}
 */
const routeHCA = async (
  session, message, channel, senderId, hotelSlug, lang,
  orderIntent, serviceIntent, bookingIntent
) => {
  // ── Revenue-generating F&B / Spa / Transport orders → posted to room folio
  if (orderIntent) {
    // Set HCA stage so subsequent turns stay in the order flow
    if (!session.stage.startsWith('order_')) {
      session.stage = 'order_menu';
      session.data.orderCategory = orderIntent;
    }
    const orderHandler = require('./order');
    return orderHandler.handle(session, message, channel, senderId, hotelSlug, lang, orderIntent);
  }

  // ── Operational service requests → staff notification, no folio charge
  if (serviceIntent) {
    if (!session.stage.startsWith('service_')) {
      session.stage = 'service_details';
      session.data.serviceType = serviceIntent;
    }
    const servicesHandler = require('./services');
    return servicesHandler.handle(session, message, channel, senderId, hotelSlug, lang, serviceIntent);
  }

  // ── Live availability lookup + booking flow
  if (bookingIntent) {
    if (session.stage === 'start' || session.stage === 'completed') {
      session.stage = 'booking_dates';
    }
    return route(session, message, channel, senderId, hotelSlug, lang);
  }

  // ── Default: delegate to the GCE stage machine
  return route(session, message, channel, senderId, hotelSlug, lang);
};

module.exports = { route, routeHCA };
