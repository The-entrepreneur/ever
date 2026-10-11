'use strict';
const { Pool } = require('pg');

class TrackerService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.TRACKER_DB_URL,
      ssl: { rejectUnauthorized: false }
    });
  }

  async resolveHotelId(identifier) {
    if (!identifier) return null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    if (isUuid) return identifier;

    try {
      const res = await this.pool.query('SELECT id FROM hotels WHERE slug = $1 LIMIT 1', [identifier]);
      return res.rows[0]?.id || null;
    } catch (err) {
      console.error('[Tracker] Error resolving hotel ID:', err.message);
      return null;
    }
  }

  async logMessageEvent(hotelIdOrSlug, sessionId, channel, intent, language, responseMs) {
    try {
      const hotelId = await this.resolveHotelId(hotelIdOrSlug);
      if (!hotelId) return;

      const query = `
        INSERT INTO message_events (hotel_id, session_id, channel, intent, lang, response_ms)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await this.pool.query(query, [hotelId, sessionId, channel, intent, language, responseMs]);
    } catch (err) {
      console.error('[Tracker] Error logging message event:', err.message);
    }
  }

  async logBookingEvent(hotelIdOrSlug, bookingId, guestName, roomType, totalValue, status, options = {}) {
    try {
      const hotelId = await this.resolveHotelId(hotelIdOrSlug);
      if (!hotelId) {
        console.warn(`[Tracker] Cannot log booking event: invalid hotel reference '${hotelIdOrSlug}'`);
        return;
      }

      const channel = options.channel || 'whatsapp';
      const checkIn = options.checkIn || null;
      const checkOut = options.checkOut || null;

      const check = await this.pool.query('SELECT id FROM booking_events WHERE booking_id = $1 LIMIT 1', [bookingId]);
      if (check.rows.length > 0) {
        const query = `
          UPDATE booking_events 
          SET status = $2 
          WHERE booking_id = $1
        `;
        await this.pool.query(query, [bookingId, status]);
      } else {
        const query = `
          INSERT INTO booking_events (hotel_id, booking_id, guest_name, room_type, booking_value, status, channel, check_in, check_out)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        await this.pool.query(query, [hotelId, bookingId, guestName, roomType, totalValue, status, channel, checkIn, checkOut]);
      }
    } catch (err) {
      console.error('[Tracker] Error logging booking event:', err.message);
    }
  }

  async logHandoffSession(hotelIdOrSlug, sessionId, channel, reason) {
    try {
      const hotelId = await this.resolveHotelId(hotelIdOrSlug);
      if (!hotelId) return;

      const check = await this.pool.query('SELECT 1 FROM handoff_sessions WHERE session_id = $1 LIMIT 1', [sessionId]);
      if (check.rows.length > 0) return; // already logged

      const query = `
        INSERT INTO handoff_sessions (hotel_id, session_id, channel, reason)
        VALUES ($1, $2, $3, $4)
      `;
      await this.pool.query(query, [hotelId, sessionId, channel, reason]);
    } catch (err) {
      console.error('[Tracker] Error logging handoff session:', err.message);
    }
  }
}

module.exports = new TrackerService();
