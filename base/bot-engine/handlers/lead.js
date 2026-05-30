'use strict';
const { Pool } = require('pg');

let pool;
const getPool = () => {
  if (!pool && process.env.TRACKER_DB_URL) {
    pool = new Pool({ connectionString: process.env.TRACKER_DB_URL });
  }
  return pool;
};

const saveLead = async (leadData) => {
  const db = getPool();
  if (!db) {
    console.warn('[Lead] No TRACKER_DB_URL set — skipping lead save');
    return;
  }
  try {
    await db.query(
      `INSERT INTO leads (session_id, client_id, name, email, phone, check_in, check_out, channel, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (email, client_id) DO UPDATE SET
         phone = EXCLUDED.phone,
         check_in = EXCLUDED.check_in,
         check_out = EXCLUDED.check_out,
         updated_at = NOW()`,
      [
        leadData.session_id,
        leadData.hotel_slug,
        leadData.name,
        leadData.email,
        leadData.phone,
        leadData.checkin,
        leadData.checkout,
        leadData.channel,
        'captured',
      ]
    );
    console.log(`[Lead] Saved — ${leadData.name} (${leadData.email})`);
  } catch (err) {
    console.error('[Lead] Save error:', err.message);
  }
};

module.exports = { saveLead };
