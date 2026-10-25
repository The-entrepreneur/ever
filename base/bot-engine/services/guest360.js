'use strict';
const { Pool } = require('pg');

/**
 * services/guest360.js — GUEST 360 MEMORY Engine
 * 
 * Provides longitudinal cross-session, cross-stay guest memory.
 * Recognizes returning guests via phone/email, extracts known preferences
 * (room attributes, dietary, VIP status), and injects a compact context block
 * into the AI prompt so the interaction never starts from zero.
 */

let pool = null;

function getPool() {
  if (!pool) {
    const connStr = process.env.SUPABASE_DB_URL || process.env.TRACKER_DB_URL || process.env.PMS_DATABASE_URL;
    if (!connStr) {
      console.warn('[Guest360] SUPABASE_DB_URL / TRACKER_DB_URL not set; running in memory-disabled mode.');
      return null;
    }
    pool = new Pool({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

/**
 * Look up Guest 360 Memory for a given hotel and sender identifier (phone or email).
 * 
 * @param {string} hotelId   - Hotel UUID
 * @param {string} identifier - Sender phone number, email, or channel senderId
 * @returns {Promise<object|null>} Guest 360 record or null if not found
 */
async function lookupGuest360(hotelId, identifier) {
  if (!hotelId || !identifier) return null;

  // 1. Try Supabase REST API RPC
  const supabaseUrl = process.env.SUPABASE_URL || 'https://oieidnsppwooknzofzeq.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseKey) {
    try {
      const fetch = globalThis.fetch || require('node-fetch');
      const resp = await fetch(`${supabaseUrl}/rest/v1/rpc/lookup_guest_360`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_hotel_id: hotelId,
          p_identifier: identifier
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        return data || null;
      }
    } catch (e) {
      console.warn('[Guest360] Supabase REST lookup fallback:', e.message);
    }
  }

  // 2. Direct PostgreSQL fallback
  const p = getPool();
  if (!p) return null;

  try {
    const res = await p.query(
      `SELECT public.lookup_guest_360($1, $2) AS guest_data`,
      [hotelId, identifier]
    );

    const guestData = res.rows[0]?.guest_data;
    if (!guestData || typeof guestData !== 'object') {
      return null;
    }
    return guestData;
  } catch (err) {
    console.error('[Guest360] lookup error:', err.message);
    return null;
  }
}

/**
 * Formats the Guest 360 record into a compact, high-impact prompt injection block (<120 tokens).
 * 
 * @param {object|null} guest - The Guest 360 object from lookupGuest360
 * @returns {string} Formatted context block for the system prompt
 */
function formatGuest360Context(guest) {
  if (!guest) {
    return [
      'GUEST 360 MEMORY:',
      '- Status: First-time visitor / Unidentified guest.',
      '- Instruction: Provide a warm, welcoming first impression. Gently introduce property amenities when relevant.'
    ].join('\n');
  }

  const lines = [
    'GUEST 360 MEMORY (RETURNING GUEST):',
    `- Name: ${guest.full_name || 'Valued Guest'} (VIP Tier: ${(guest.vip_tier || 'standard').toUpperCase()})`,
    `- Stay History: ${guest.stay_count || 1} past stay(s)`
  ];

  if (Array.isArray(guest.room_preferences) && guest.room_preferences.length > 0) {
    lines.push(`- Room Preferences: ${guest.room_preferences.join(', ')}`);
  }

  if (Array.isArray(guest.dietary_preferences) && guest.dietary_preferences.length > 0) {
    lines.push(`- Dietary Needs: ${guest.dietary_preferences.join(', ')}`);
  }

  if (guest.special_notes) {
    lines.push(`- Staff Notes: ${guest.special_notes}`);
  }

  if (guest.recent_booking) {
    lines.push(
      `- Recent Stay: ${guest.recent_booking.room_type} (${guest.recent_booking.check_in} to ${guest.recent_booking.check_out})`
    );
  }

  lines.push(
    `- Instruction: Greet ${guest.first_name || guest.full_name} warmly by name! Naturally acknowledge their return to the hotel. Never make them feel like a stranger.`
  );

  return lines.join('\n');
}

/**
 * Upsert or update a guest's profile and preferences in real-time when
 * stated during conversation or booking.
 */
async function upsertGuestProfile(hotelId, {
  fullName,
  email = null,
  phone = null,
  roomPreference = null,
  dietaryPreference = null,
  specialNotes = null,
  channel = null
}) {
  if (!hotelId || !fullName) return null;

  // 1. Try Supabase REST API RPC
  const supabaseUrl = process.env.SUPABASE_URL || 'https://oieidnsppwooknzofzeq.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseKey) {
    try {
      const fetch = globalThis.fetch || require('node-fetch');
      const resp = await fetch(`${supabaseUrl}/rest/v1/rpc/upsert_guest_360`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          p_hotel_id: hotelId,
          p_full_name: fullName,
          p_email: email,
          p_phone: phone,
          p_room_preference: roomPreference,
          p_dietary_preference: dietaryPreference,
          p_special_notes: specialNotes,
          p_channel: channel || 'direct'
        })
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch (e) {
      console.warn('[Guest360] Supabase REST upsert fallback:', e.message);
    }
  }

  // 2. Direct PostgreSQL fallback
  const p = getPool();
  if (!p) return null;

  try {
    const res = await p.query(
      `SELECT public.upsert_guest_360($1, $2, $3, $4, $5, $6, $7, $8) AS guest_id`,
      [
        hotelId,
        fullName,
        email,
        phone,
        roomPreference,
        dietaryPreference,
        specialNotes,
        channel
      ]
    );
    return res.rows[0]?.guest_id || null;
  } catch (err) {
    console.error('[Guest360] upsert error:', err.message);
    return null;
  }
}

module.exports = {
  lookupGuest360,
  formatGuest360Context,
  upsertGuestProfile
};
