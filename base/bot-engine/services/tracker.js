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
        INSERT INTO message_events (client_id, session_id, channel, intent, lang, response_ms)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      await this.pool.query(query, [clientId, sessionId, channel, intent, language, responseMs]);
    } catch (err) {
      console.error('[Tracker] Error logging message event:', err.message);
    }
  }

  async logBookingEvent(clientId, bookingId, guestName, roomType, totalValue, status) {
    try {
      const check = await this.pool.query('SELECT 1 FROM booking_events WHERE booking_id = $1 LIMIT 1', [bookingId]);
      if (check.rows.length > 0) {
        const query = `
          UPDATE booking_events 
          SET status = $2 
          WHERE booking_id = $1
        `;
        await this.pool.query(query, [bookingId, status]);
      } else {
        const query = `
          INSERT INTO booking_events (client_id, booking_id, guest_name, room_type, booking_value, status)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await this.pool.query(query, [clientId, bookingId, guestName, roomType, totalValue, status]);
      }
    } catch (err) {
      console.error('[Tracker] Error logging booking event:', err.message);
    }
  }

  async logHandoffSession(clientId, sessionId, channel, reason) {
    try {
      const check = await this.pool.query('SELECT 1 FROM handoff_sessions WHERE session_id = $1 LIMIT 1', [sessionId]);
      if (check.rows.length > 0) return; // already logged

      const query = `
        INSERT INTO handoff_sessions (client_id, session_id, channel, reason)
        VALUES ($1, $2, $3, $4)
      `;
      await this.pool.query(query, [clientId, sessionId, channel, reason]);
    } catch (err) {
      console.error('[Tracker] Error logging handoff session:', err.message);
    }
  }
}

module.exports = new TrackerService();
