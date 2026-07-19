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
// Routes outbound WhatsApp messages through the OpenBSP hosted instance.
//
// Auth: TWO headers required (per AUTH.md):
//   apikey  → Supabase publishable/anon key  (OPENBSP_PUBLISHABLE_KEY)
//   api-key → Owner-scoped secret key        (OPENBSP_OWNER_API_KEY)
// Do NOT send Authorization: Bearer <api-key> — PostgREST will reject it (PGRST301).
//
// Required payload fields (MIGRATING_FROM_TWILIO.md):
//   organization_id      — the UUID of EVER's OpenBSP organization (OPENBSP_ORGANIZATION_ID)
//   organization_address — hotel's Meta phone_number_id (PHONE_NUMBER_ID from whatsapp_accounts)
//   contact_address      — guest's bare E.164 number (no + prefix, no whatsapp: prefix)
//   direction            — always "outgoing" for sends
//   service              — "whatsapp"
const openBspSend = async (to, text, opts = {}) => {
  const baseUrl       = process.env.OPENBSP_BASE_URL;
  const publishable   = process.env.OPENBSP_PUBLISHABLE_KEY;
  const ownerKey      = process.env.OPENBSP_OWNER_API_KEY;
  const orgId         = process.env.OPENBSP_ORGANIZATION_ID;  // required for every POST
  const phoneNumberId = process.env.PHONE_NUMBER_ID;          // per-hotel phone_number_id

  if (!baseUrl || !publishable || !ownerKey) {
    throw new Error('[WhatsApp/OpenBSP] Agency-level credentials not set (OPENBSP_BASE_URL, OPENBSP_PUBLISHABLE_KEY, OPENBSP_OWNER_API_KEY)');
  }
  if (!orgId) {
    throw new Error('[WhatsApp/OpenBSP] OPENBSP_ORGANIZATION_ID not set. This field is required in every message POST.');
  }
  if (!phoneNumberId) {
    throw new Error('[WhatsApp/OpenBSP] PHONE_NUMBER_ID not set for this hotel. Populate from whatsapp_accounts after Embedded Signup.');
  }

  // bare E.164: strip + and any whatsapp: prefix — OpenBSP does not use the Twilio prefix format
  const contactAddress = String(to).replace(/^whatsapp:\+?/i, '').replace(/^\+/, '');

  let content;
  if (opts.template) {
    // Template message — IMPORTANT: templates must be re-registered directly with Meta
    // under the hotel's WABA. ContentSid values from Twilio cannot be ported.
    content = {
      version: '1',
      type:    'data',
      kind:    'template',
      data: {
        name:       opts.template.name,
        language:   { code: opts.template.language || 'en_US' },
        parameters: opts.template.parameters || [],
      },
    };
  } else if (opts.media) {
    // Media message — OpenBSP fetches and uploads to Meta automatically
    // Inbound media arrives as signed Supabase Storage URL in content.file.uri
    content = {
      version: '1',
      type:    'file',
      kind:    opts.media.kind || 'document',   // image | video | audio | document | sticker
      file: {
        mime_type: opts.media.mime_type,
        uri:       opts.media.uri,              // public URL or internal:// Supabase Storage URI
        name:      opts.media.name || null,
        size:      opts.media.size || null,
      },
      text: text || null,
    };
  } else {
    // Standard text message
    content = {
      version: '1',
      type:    'text',
      kind:    'text',
      text,
    };
  }

  const res = await fetch(`${baseUrl}/rest/v1/messages`, {
    method: 'POST',
    headers: {
      'apikey':        publishable,
      'api-key':       ownerKey,
      'Content-Type':  'application/json',
      'Prefer':        'return=representation',
    },
    body: JSON.stringify({
      organization_id:      orgId,          // required — RLS will 42501 without it
      organization_address: phoneNumberId,  // hotel's Meta phone_number_id
      contact_address:      contactAddress, // bare E.164, no + prefix
      service:              'whatsapp',
      direction:            'outgoing',     // always set explicitly on sends
      content,
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
const sendMessage = async (to, text, opts = {}) => {
  const provider = (process.env.WHATSAPP_PROVIDER || 'openbsp').toLowerCase();

  switch (provider) {
    case 'openbsp':    return openBspSend(to, text, opts);
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

// ── OpenBSP Conversation Pause (Native Handoff) ────────────────────────────
// OpenBSP has a native "conversation pause" feature that directly replaces
// the Redis handoff flag for the OpenBSP provider.
// When a staff member takes over, we pause the conversation programmatically
// via the OpenBSP REST API so the AI agent goes silent for that contact only.
//
// organization_address = hotel's Meta phone_number_id (the "from" side)
// contact_address      = guest's bare E.164 number    (the "to" side)
//
// NOTE: The exact endpoint shape is pending confirmation from the OpenBSP team
// (see PRD/OPENBSP_OPEN_QUESTIONS.md). The below call will be updated once
// the API contract for conversation pause is confirmed.
const openBspPauseConversation = async (organizationAddress, contactAddress, pause = true) => {
  const baseUrl     = process.env.OPENBSP_BASE_URL;
  const publishable = process.env.OPENBSP_PUBLISHABLE_KEY;
  const ownerKey    = process.env.OPENBSP_OWNER_API_KEY;

  if (!baseUrl || !publishable || !ownerKey) return;

  try {
    // Endpoint TBC — awaiting OpenBSP API confirmation
    const res = await fetch(`${baseUrl}/rest/v1/conversations?organization_address=eq.${organizationAddress}&contact_address=eq.${contactAddress}`, {
      method:  'PATCH',
      headers: {
        'apikey':       publishable,
        'api-key':      ownerKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paused: pause }),
    });
    if (!res.ok) {
      console.warn(`[WhatsApp/OpenBSP] Conversation pause (paused=${pause}) failed: ${res.status}`);
    }
  } catch (err) {
    console.warn('[WhatsApp/OpenBSP] pauseConversation error:', err.message);
  }
};

// ── Session Pause/Resume (Provider-aware) ──────────────────────────────────
// For OpenBSP: uses native conversation pause above.
// For EvolutionAPI: calls pauseWebhook endpoint.
// For cloud_api: no-op — handoff is managed by Redis flag only.
const pauseSession = async (remoteJid) => {
  const provider = (process.env.WHATSAPP_PROVIDER || 'openbsp').toLowerCase();

  if (provider === 'openbsp') {
    const phoneNumberId = process.env.PHONE_NUMBER_ID;
    // remoteJid is the guest's number (bare E.164 for OpenBSP)
    const contactAddress = String(remoteJid).replace(/^whatsapp:\+?/i, '').replace(/^\+/, '');
    return openBspPauseConversation(phoneNumberId, contactAddress, true);
  }

  if (provider === 'evolution') {
    const baseUrl  = process.env.EVOLUTION_BASE_URL;
    const apiKey   = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE;
    await fetch(`${baseUrl}/chat/pauseWebhook/${instance}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
      body:    JSON.stringify({ remoteJid, pause: true }),
    });
  }
  // cloud_api: no-op, Redis flag handles engine silencing
};

const resumeSession = async (remoteJid) => {
  const provider = (process.env.WHATSAPP_PROVIDER || 'openbsp').toLowerCase();

  if (provider === 'openbsp') {
    const phoneNumberId = process.env.PHONE_NUMBER_ID;
    const contactAddress = String(remoteJid).replace(/^whatsapp:\+?/i, '').replace(/^\+/, '');
    return openBspPauseConversation(phoneNumberId, contactAddress, false);
  }

  if (provider === 'evolution') {
    const baseUrl  = process.env.EVOLUTION_BASE_URL;
    const apiKey   = process.env.EVOLUTION_API_KEY;
    const instance = process.env.EVOLUTION_INSTANCE;
    await fetch(`${baseUrl}/chat/pauseWebhook/${instance}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
      body:    JSON.stringify({ remoteJid, pause: false }),
    });
  }
};

module.exports = { sendMessage, sendQuickReply, pauseSession, resumeSession };
