'use strict';

/**
 * meta-adapter.js
 * Dispatcher to send messages to Facebook Messenger or Instagram DM users.
 * Uses Meta Send API.
 */
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const sendMessage = async (to, text) => {
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

module.exports = { sendMessage };
