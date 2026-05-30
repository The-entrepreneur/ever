'use strict';
/**
 * whatsapp-adapter.js
 * Abstraction layer switching between WhatsApp providers via WHATSAPP_PROVIDER env var.
 * Providers: twilio | evolution | cloud_api
 *
 * Usage (from n8n Code node or bot-engine):
 *   const wa = require('./adapters/whatsapp-adapter');
 *   await wa.sendMessage(to, text);
 */
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

// ── Twilio ─────────────────────────────────────────────────────────────────
const twilioSend = async (to, text) => {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

  if (!sid || !token) throw new Error('[WhatsApp] Twilio credentials not set');

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${sid}:${token}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: from,
        To: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`,
        Body: text,
      }),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[WhatsApp/Twilio] Send failed: ${err}`);
  }
  return await res.json();
};

// ── EvolutionAPI ───────────────────────────────────────────────────────────
const evolutionSend = async (to, text) => {
  const baseUrl  = process.env.EVOLUTION_API_URL;     // e.g. https://evo.youragency.com
  const apiKey   = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;   // client-specific instance name

  if (!baseUrl || !apiKey || !instance) throw new Error('[WhatsApp] EvolutionAPI config incomplete');

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
  return await res.json();
};

// ── WhatsApp Cloud API (Meta) ──────────────────────────────────────────────
const cloudApiSend = async (to, text) => {
  const token   = process.env.META_PAGE_ACCESS_TOKEN;
  const phoneId = process.env.META_PHONE_NUMBER_ID;   // From Meta Business dashboard

  if (!token || !phoneId) throw new Error('[WhatsApp] Meta Cloud API config incomplete');

  const res = await fetch(
    `https://graph.facebook.com/v19.0/${phoneId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
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
  return await res.json();
};

// ── Public interface ───────────────────────────────────────────────────────
const sendMessage = async (to, text) => {
  const provider = (process.env.WHATSAPP_PROVIDER || 'twilio').toLowerCase();

  switch (provider) {
    case 'twilio':     return twilioSend(to, text);
    case 'evolution':  return evolutionSend(to, text);
    case 'cloud_api':  return cloudApiSend(to, text);
    default:
      throw new Error(`[WhatsApp] Unknown provider: ${provider}. Options: twilio | evolution | cloud_api`);
  }
};

/**
 * Send a message with a reply button (template-style — Twilio only for now)
 * Used for upsell confirmations with Yes/No quick replies
 */
const sendQuickReply = async (to, bodyText, buttons) => {
  const provider = (process.env.WHATSAPP_PROVIDER || 'twilio').toLowerCase();

  // Quick replies via plain text on non-Twilio providers (buttons not universally supported)
  if (provider !== 'twilio') {
    const optionText = buttons.map((b, i) => `${i + 1}. ${b}`).join('\n');
    return sendMessage(to, `${bodyText}\n\n${optionText}`);
  }

  return twilioSend(to, `${bodyText}\n\nReply: ${buttons.join(' / ')}`);
};

const pauseSession = async (remoteJid) => {
  const provider = (process.env.WHATSAPP_PROVIDER || 'twilio').toLowerCase();
  if (provider !== 'evolution') return;
  const baseUrl  = process.env.EVOLUTION_API_URL;
  const apiKey   = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  await fetch(`${baseUrl}/chat/pauseWebhook/${instance}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
    body:    JSON.stringify({ remoteJid, pause: true }),
  });
};

const resumeSession = async (remoteJid) => {
  const provider = (process.env.WHATSAPP_PROVIDER || 'twilio').toLowerCase();
  if (provider !== 'evolution') return;
  const baseUrl  = process.env.EVOLUTION_API_URL;
  const apiKey   = process.env.EVOLUTION_API_KEY;
  const instance = process.env.EVOLUTION_INSTANCE;

  await fetch(`${baseUrl}/chat/pauseWebhook/${instance}`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
    body:    JSON.stringify({ remoteJid, pause: false }),
  });
};

module.exports = { sendMessage, sendQuickReply, pauseSession, resumeSession };
