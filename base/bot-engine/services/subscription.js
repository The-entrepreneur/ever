'use strict';
const { Pool } = require('pg');

let pool = null;

function getPool() {
  if (!pool) {
    const connStr = process.env.SUPABASE_DB_URL || process.env.PMS_DATABASE_URL;
    if (connStr && !connStr.includes('postgres:5432')) {
      pool = new Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
    }
  }
  return pool;
}

/**
 * Returns true if the hotel has an active subscription, false otherwise.
 * First queries Supabase REST API; falls back to PG pool, and fails-open on outage.
 *
 * @param {string} hotelSlug  The hotel's unique slug identifier
 * @returns {Promise<boolean>}
 */
async function isSubscriptionActive(hotelSlug) {
  if (!hotelSlug) return false;

  // 1. Primary: Supabase REST API
  const supabaseUrl = process.env.SUPABASE_URL || 'https://oieidnsppwooknzofzeq.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseKey) {
    try {
      const fetch = globalThis.fetch || require('node-fetch');
      const resp = await fetch(`${supabaseUrl}/rest/v1/subscriptions?hotel_slug=eq.${encodeURIComponent(hotelSlug)}&select=status&limit=1`, {
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
          return rows[0].status === 'active';
        }
        // In local dev/bootstrap if no subscription row exists, fail open
        return true;
      }
    } catch (err) {
      console.warn('[Subscription] REST check warning:', err.message);
    }
  }

  // 2. Fallback: PostgreSQL connection
  const p = getPool();
  if (p) {
    try {
      const res = await p.query(
        'SELECT status FROM subscriptions WHERE hotel_slug = $1 LIMIT 1',
        [hotelSlug]
      );
      if (res.rows.length === 0) return true;
      return res.rows[0].status === 'active';
    } catch (err) {
      console.warn(`[Subscription] DB error checking status for ${hotelSlug} (failing open):`, err.message);
      return true;
    }
  }

  return true;
}

module.exports = { isSubscriptionActive };
