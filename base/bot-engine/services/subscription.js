'use strict';
const { Pool } = require('pg');

// ──────────────────────────────────────────────────────────────
// SubscriptionService
// Checks the Supabase `subscriptions` table to confirm whether
// a hotel's account is active before forwarding webhook traffic
// to its n8n instance. Uses a direct PostgreSQL connection
// (DATABASE_URL must point to the Supabase postgres endpoint).
// ──────────────────────────────────────────────────────────────

let pool = null;

function getPool() {
  if (!pool) {
    const connStr = process.env.SUPABASE_DB_URL || process.env.PMS_DATABASE_URL;
    if (!connStr) {
      throw new Error('[Subscription] SUPABASE_DB_URL is not set. Cannot check subscription status.');
    }
    pool = new Pool({ connectionString: connStr, ssl: { rejectUnauthorized: false } });
  }
  return pool;
}

/**
 * Returns true if the hotel has an active subscription, false otherwise.
 * On DB errors it defaults to true (fail-open) to avoid blocking messages
 * due to a transient DB outage. The error is logged for ops visibility.
 *
 * @param {string} hotelSlug  The hotel's unique slug identifier
 * @returns {Promise<boolean>}
 */
async function isSubscriptionActive(hotelSlug) {
  try {
    const result = await getPool().query(
      `SELECT status, tier FROM subscriptions WHERE hotel_slug = $1 LIMIT 1`,
      [hotelSlug]
    );

    if (result.rows.length === 0) {
      // No subscription record found — treat as inactive to avoid rogue traffic
      console.warn(`[Subscription] No subscription record found for: ${hotelSlug}`);
      return false;
    }

    const { status } = result.rows[0];
    return status === 'active';
  } catch (err) {
    // Fail-open on DB errors to avoid blocking live hotel messages due to outages
    console.error(`[Subscription] DB error checking subscription for ${hotelSlug}:`, err.message);
    return true;
  }
}

/**
 * Returns the full subscription record for a hotel, or null if not found.
 * Useful for tier-aware routing logic.
 *
 * @param {string} hotelSlug
 * @returns {Promise<{hotel_slug: string, tier: string, status: string} | null>}
 */
async function getSubscription(hotelSlug) {
  try {
    const result = await getPool().query(
      `SELECT hotel_slug, tier, status FROM subscriptions WHERE hotel_slug = $1 LIMIT 1`,
      [hotelSlug]
    );
    return result.rows[0] || null;
  } catch (err) {
    console.error(`[Subscription] DB error fetching subscription for ${hotelSlug}:`, err.message);
    return null;
  }
}

module.exports = { isSubscriptionActive, getSubscription };
