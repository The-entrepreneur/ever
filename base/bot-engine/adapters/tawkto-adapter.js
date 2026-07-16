'use strict';

/**
 * tawkto-adapter.js
 * Dispatcher to send messages to active Tawk.to chats.
 * Uses Tawk.to REST API.
 */
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const sendMessage = async (to, text) => {
  const apiKey = process.env.TAWKTO_API_KEY;
  if (!apiKey) {
    throw new Error('[Tawk.to] TAWKTO_API_KEY not set');
  }

  const authHeader = 'Basic ' + Buffer.from(`${apiKey}:`).toString('base64');

  const baseUrl = process.env.TAWKTO_API_URL || 'https://api.tawk.to';
  const res = await fetch(`${baseUrl}/v1/chat/${to}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify({
      text,
      type: 'msg',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[Tawk.to/Send] Dispatch failed: ${err}`);
  }

  return await res.json();
};

module.exports = { sendMessage };
