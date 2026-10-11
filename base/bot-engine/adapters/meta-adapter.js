'use strict';

/**
 * meta-adapter.js
 * Dispatcher to send messages to Facebook Messenger or Instagram DM users.
 * Supports OpenBSP unified architecture (primary) or Meta Send API directly (fallback).
 */
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const sendViaOpenBSP = async (to, text, opts = {}) => {
  const baseUrl       = process.env.OPENBSP_BASE_URL;
  const publishable   = process.env.OPENBSP_PUBLISHABLE_KEY;
  const ownerKey      = process.env.OPENBSP_OWNER_API_KEY;
  const orgId         = process.env.OPENBSP_ORGANIZATION_ID;
  const service       = opts.service || 'instagram'; // 'instagram' or 'facebook'
  const orgAddress    = opts.organization_address || process.env.INSTAGRAM_PAGE_ID || process.env.META_PAGE_ID;

  if (!baseUrl || !publishable || !ownerKey) {
    throw new Error('[Meta/OpenBSP] Agency credentials missing (OPENBSP_BASE_URL, OPENBSP_PUBLISHABLE_KEY, OPENBSP_OWNER_API_KEY)');
  }
  if (!orgId) {
    throw new Error('[Meta/OpenBSP] OPENBSP_ORGANIZATION_ID not set');
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
      organization_id:      orgId,
      organization_address: orgAddress || 'default',
      contact_address:      to,
      service,
      direction:            'outgoing',
      content: {
        version: '1',
        type:    'text',
        kind:    'text',
        text,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[Meta/OpenBSP] Send failed (${res.status}): ${err}`);
  }

  return await res.json();
};

const sendViaMetaDirect = async (to, text) => {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) {
    throw new Error('[Meta] META_PAGE_ACCESS_TOKEN credentials not set');
  }

  const baseUrl = process.env.META_API_URL || 'https://graph.facebook.com';
  const res = await fetch(`${baseUrl}/v19.0/me/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_type: 'MESSAGE_TAG',
      tag: 'CONFIRMED_EVENT_UPDATE',
      recipient: { id: to },
      message: { text },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[Meta/Send] Dispatch failed: ${err}`);
  }

  return await res.json();
};

const sendMessage = async (to, text, opts = {}) => {
  // If OpenBSP credentials are present, use OpenBSP unified endpoint; otherwise fallback to Meta direct
  if (process.env.OPENBSP_BASE_URL && process.env.OPENBSP_PUBLISHABLE_KEY && process.env.OPENBSP_OWNER_API_KEY) {
    try {
      return await sendViaOpenBSP(to, text, opts);
    } catch (err) {
      console.warn(`[MetaAdapter] OpenBSP send failed (${err.message}). Attempting direct Meta fallback...`);
      if (process.env.META_PAGE_ACCESS_TOKEN) {
        return await sendViaMetaDirect(to, text);
      }
      throw err;
    }
  }

  return await sendViaMetaDirect(to, text);
};

module.exports = { sendMessage, sendViaOpenBSP, sendViaMetaDirect };
