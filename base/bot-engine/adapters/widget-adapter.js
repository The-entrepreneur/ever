'use strict';

/**
 * widget-adapter.js
 * Dispatcher to forward website widget reminders to the main dashboard/web application.
 */
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const sendMessage = async (to, text) => {
  const url = process.env.DASHBOARD_PUSH_URL || 
              process.env.WIDGET_PUSH_URL || 
              process.env.DASHBOARD_MESSAGE_WEBHOOK;

  if (!url) {
    console.warn(`[Widget] DASHBOARD_PUSH_URL not configured. Logged reminder payload: session_id=${to}, text="${text}"`);
    return { success: false, reason: 'push_url_missing' };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Internal-Key': process.env.INTERNAL_API_KEY || '',
    },
    body: JSON.stringify({
      session_id: to,
      message: text,
      channel: 'website_widget',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`[Widget/Send] Dashboard notification failed: ${err}`);
  }

  return await res.json();
};

module.exports = { sendMessage };
