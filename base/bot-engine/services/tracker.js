'use strict';
const { Pool } = require('pg');

class TrackerService {
  constructor() {
    this.pool = null;
    const connStr = process.env.TRACKER_DB_URL || process.env.SUPABASE_DB_URL || process.env.PMS_DATABASE_URL;
    if (connStr && !connStr.includes('postgres:5432')) {
      this.pool = new Pool({
        connectionString: connStr,
        ssl: { rejectUnauthorized: false }
      });
    }
  }

  async resolveHotelId(identifier) {
    if (!identifier) return null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    if (isUuid) return identifier;

    // 1. Try Supabase REST API (primary cloud transport)
    const supabaseUrl = process.env.SUPABASE_URL || 'https://oieidnsppwooknzofzeq.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseKey) {
      try {
        const fetch = globalThis.fetch || require('node-fetch');
        const resp = await fetch(`${supabaseUrl}/rest/v1/hotels?slug=eq.${encodeURIComponent(identifier)}&select=id&limit=1`, {
          method: 'GET',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Accept': 'application/json'
          }
        });
        if (resp.ok) {
          const rows = await resp.json();
          if (rows && rows.length > 0) {
            return rows[0].id;
          }
        }
      } catch (err) {
        console.warn('[Tracker] Supabase REST hotel lookup warning:', err.message);
      }
    }

    // 2. Direct PostgreSQL fallback if pool is configured
    if (this.pool) {
      try {
        const res = await this.pool.query('SELECT id FROM hotels WHERE slug = $1 LIMIT 1', [identifier]);
        return res.rows[0]?.id || null;
      } catch (err) {
        console.error('[Tracker] Error resolving hotel ID via PG:', err.message);
      }
    }

    return null;
  }

  async logMessageEvent(hotelIdOrSlug, sessionId, channel, intent, language, responseMs) {
    try {
      const hotelId = await this.resolveHotelId(hotelIdOrSlug);
      if (!hotelId) return;

      const supabaseUrl = process.env.SUPABASE_URL || 'https://oieidnsppwooknzofzeq.supabase.co';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseKey) {
        try {
          const fetch = globalThis.fetch || require('node-fetch');
          await fetch(`${supabaseUrl}/rest/v1/message_events`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              hotel_id: hotelId,
              session_id: sessionId,
              channel: channel,
              intent: intent,
              lang: language,
              response_ms: responseMs
            })
          });
          return;
        } catch (e) {
          // fall through to pg pool if available
        }
      }

      if (this.pool) {
        const query = `
          INSERT INTO message_events (hotel_id, session_id, channel, intent, lang, response_ms)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await this.pool.query(query, [hotelId, sessionId, channel, intent, language, responseMs]);
      }
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

      const supabaseUrl = process.env.SUPABASE_URL || 'https://oieidnsppwooknzofzeq.supabase.co';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (supabaseKey) {
        try {
          const fetch = globalThis.fetch || require('node-fetch');
          await fetch(`${supabaseUrl}/rest/v1/booking_events`, {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              hotel_id: hotelId,
              booking_id: bookingId,
              guest_name: guestName,
              room_type: roomType,
              total_value: totalValue,
              status: status,
              channel: channel,
              check_in: checkIn,
              check_out: checkOut
            })
          });
          return;
        } catch (e) {
          // fallback to pool
        }
      }

      if (this.pool) {
        const query = `
          INSERT INTO booking_events (
            hotel_id, booking_id, guest_name, room_type, total_value, status, channel, check_in, check_out
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        await this.pool.query(query, [
          hotelId, bookingId, guestName, roomType, totalValue, status, channel, checkIn, checkOut
        ]);
      }
    } catch (err) {
      console.error('[Tracker] Error logging booking event:', err.message);
    }
  }
}

module.exports = new TrackerService();
