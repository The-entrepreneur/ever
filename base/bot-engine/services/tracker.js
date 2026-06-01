'use strict';
const { Pool } = require('pg');

class TrackerService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.TRACKER_DB_URL,
      ssl: { rejectUnauthorized: false }
    });
  }

  async logMessageEvent(clientId, sessionId, channel, intent, language, responseMs) {
    try {
      const query = `
        INSERT INTO message_events (client_id, session_id, channel, intent, language, response_ms)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await this.pool.query(query, [clientId, sessionId, channel, intent, language, responseMs]);
    } catch (err) {
      console.error('[Tracker] Error logging message event:', err.message);
    }
  }

  async logBookingEvent(clientId, bookingId, guestName, roomType, totalValue, status) {
    try {
      const query = `
        INSERT INTO booking_events (client_id, booking_id, guest_name, room_type, total_value, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (booking_id) 
        DO UPDATE SET status = EXCLUDED.status, updated_at = NOW()
      `;
      await this.pool.query(query, [clientId, bookingId, guestName, roomType, totalValue, status]);
    } catch (err) {
      console.error('[Tracker] Error logging booking event:', err.message);
    }
  }

  async logHandoffSession(clientId, sessionId, channel, reason) {
    try {
      const query = `
        INSERT INTO handoff_sessions (client_id, session_id, channel, reason)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (session_id) DO NOTHING
      `;
      await this.pool.query(query, [clientId, sessionId, channel, reason]);
    } catch (err) {
      console.error('[Tracker] Error logging handoff session:', err.message);
    }
  }
}

module.exports = new TrackerService();
