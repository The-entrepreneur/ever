'use strict';
const bookingHandler  = require('./booking');
const upsellHandler   = require('./upsell');

/**
 * Routes incoming message to the correct handler based on session stage.
 * @param {object} session - Current session state (mutated in place)
 * @param {string} message - Guest message text
 * @param {string} channel - Channel identifier
 * @param {string} senderId - Sender identifier
 * @param {string} hotelSlug - Hotel identifier
 * @param {string} lang - Detected language code
 * @returns {string} Reply to send to guest
 */
const route = async (session, message, channel, senderId, hotelSlug, lang) => {
  switch (session.stage) {
    case 'start':
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
      return bookingHandler.handle(session, message, channel, senderId, hotelSlug, lang);
  }
};

module.exports = { route };
