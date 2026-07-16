'use strict';
/**
 * whatsapp-adapter.js
 * Abstraction layer switching between WhatsApp providers via WHATSAPP_PROVIDER env var.
 *
 * WHATSAPP_PROVIDER options:
 *   openbsp   — OpenBSP hosted instance (primary, default)
 *               Messages routed via https://nheelwshzbgenpavwhcy.supabase.co
 *               Agency-level credentials (OPENBSP_BASE_URL, OPENBSP_PUBLISHABLE_KEY,
 *               OPENBSP_OWNER_API_KEY). Per-client PHONE_NUMBER_ID from whatsapp_accounts.
 *   evolution — EvolutionAPI self-hosted (fallback for clients who cannot use OpenBSP)
 *   cloud_api — Meta WhatsApp Cloud API direct (advanced / bypass option)
 *
 * Usage (from bot-engine handlers):
 *   const wa = require('./adapters/whatsapp-adapter');
 *   await wa.sendMessage(to, text);
 */
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

// ── OpenBSP (Primary Provider) ─────────────────────────────────────────────
// Routes outbound WhatsApp messages through the OpenBSP hosted instance,
// which forwards them to Meta Cloud API. Inbound messages arrive directly
// at the n8n callback_url — OpenBSP is NOT in the inbound path.
//
// Auth: two non-standard PostgREST headers required.
// Do NOT use Authorization: Bearer — PostgREST will reject it.
//   apikey  → Supabase anon key (OPENBSP_PUBLISHABLE_KEY)
//   api-key → Owner-scoped secret key (OPENBSP_OWNER_API_KEY)
const openBspSend = async (to, text) => {
  const baseUrl      = process.env.OPENBSP_BASE_URL;
  const publishable  = process.env.OPENBSP_PUBLISHABLE_KEY;
  const ownerKey     = process.env.OPENBSP_OWNER_API_KEY;
  const phoneNumberId = process.env.PHONE_NUMBER_ID; // per-hotel, from whatsapp_accounts

  if (!baseUrl || !publishable || !ownerKey) {
    throw new Error('[WhatsApp/OpenBSP] Agency-level OpenBSP credentials not set (OPENBSP_BASE_URL, OPENBSP_PUBLISHABLE_KEY, OPENBSP_OWNER_API_KEY)');
  }
  if (!phoneNumberId) {
    throw new Error('[WhatsApp/OpenBSP] PHONE_NUMBER_ID not set for this hotel. Populate from whatsapp_accounts after connection.');
  }

  const res = await fetch(`${baseUrl}/rest/v1/messages`, {
    method: 'POST',
    headers: {
      'apikey':        publishable,
      'api-key':       ownerKey,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      organization_address: phoneNumberId,   // hotel's Meta phone_number_id
      contact_address:      to,              // guest's WhatsApp number in E.164
      content: {
        type: 'text',
        text: { body: text },
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[WhatsApp/OpenBSP] Send failed (${res.status}): ${err}`);
  }
  return res.json();
};

// ── EvolutionAPI (Fallback) ────────────────────────────────────────────────
// Used for clients who explicitly cannot use OpenBSP Embedded Signup,
// or clients who already self-host EvolutionAPI.
// Set WHATSAPP_PROVIDER=evolution in the client .env to activate.
const evolutionSend = async (to, text) => {
  const baseUrl  = process.env.EVOLUTION_BASE_URL;
  const apiKey   = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  if (!baseUrl || !apiKey || !instance) throw new Error('[WhatsApp] EvolutionAPI config incomplete (EVOLUTION_BASE_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE)');

  const res = await fetch(`${baseUrl}/message/sendText/${instance}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': apiKey,
    },
    body: JSON.stringify({
      number: to.replace(/\D/g, ''), // strip non-numeric
      text,
    }),
  });
  if (!res.ok) throw new Error(`[WhatsApp/Evolution] Send failed: ${await res.text()}`);
  return res.json();
};

// ── WhatsApp Cloud API Direct (Advanced) ───────────────────────────────────
// Calls Meta Cloud API directly using the hotel's own access_token.
// Use when bypassing OpenBSP entirely (e.g. OpenBSP downtime emergency).
const cloudApiSend = async (to, text) => {
  const token   = process.env.META_PAGE_ACCESS_TOKEN;
  const phoneId = process.env.META_PHONE_NUMBER_ID;

  if (!token || !phoneId) throw new Error('[WhatsApp] Meta Cloud API config incomplete (META_PAGE_ACCESS_TOKEN, META_PHONE_NUMBER_ID)');

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'text',
        text: { body: text },
      }),
    }
  );
  if (!res.ok) throw new Error(`[WhatsApp/CloudAPI] Send failed: ${await res.text()}`);
  return res.json();
};

// ── Public Interface ───────────────────────────────────────────────────────
const sendMessage = async (to, text) => {
  const provider = (process.env.WHATSAPP_PROVIDER || 'openbsp').toLowerCase();

  switch (provider) {
    case 'openbsp':    return openBspSend(to, text);
    case 'evolution':  return evolutionSend(to, text);
    case 'cloud_api':  return cloudApiSend(to, text);
    default:
      throw new Error(`[WhatsApp] Unknown provider: "${provider}". Valid options: openbsp | evolution | cloud_api`);
  }
};

/**
 * Send a message with quick-reply options.
 * Renders as numbered plain text list on all providers (interactive buttons
 * require pre-approved WhatsApp templates and are not supported in the
 * generic flow).
 */
const sendQuickReply = async (to, bodyText, buttons) => {
  const optionText = buttons.map((b, i) => `${i + 1}. ${b}`).join('\n');
  return sendMessage(to, `${bodyText}\n\n${optionText}`);
};

// ── EvolutionAPI Session Control (Handoff) ─────────────────────────────────
// Pauses / resumes EvolutionAPI message processing for a session during
// a human agent handoff. No-op for OpenBSP and cloud_api providers —
// handoff silencing for those is handled by the Redis handoff flag in
// bot-engine/redis/client.js.
const pauseSession = async (remoteJid) => {
  const provider = (process.env.WHATSAPP_PROVIDER || 'openbsp').toLowerCase();
  if (provider !== 'evolution') return;
  const baseUrl  = process.env.EVOLUTION_BASE_URL;
  const apiKey   = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  await fetch(`${baseUrl}/chat/pauseWebhook/${instance}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
    body:    JSON.stringify({ remoteJid, pause: true }),
  });
};

const resumeSession = async (remoteJid) => {
  const provider = (process.env.WHATSAPP_PROVIDER || 'openbsp').toLowerCase();
  if (provider !== 'evolution') return;
  const baseUrl  = process.env.EVOLUTION_BASE_URL;
  const apiKey   = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  await fetch(`${baseUrl}/chat/pauseWebhook/${instance}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
    body:    JSON.stringify({ remoteJid, pause: false }),
  });
};

module.exports = { sendMessage, sendQuickReply, pauseSession, resumeSession };
