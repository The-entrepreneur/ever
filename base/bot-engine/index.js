'use strict';
require('dotenv').config();

const express = require('express');
const { getSession, setSession } = require('./redis/client');
const { route } = require('./handlers/router');

const app = express();
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Main message endpoint — called by n8n bot engine proxy ───
app.post('/message', async (req, res) => {
  const startMs = Date.now();
  try {
    const { session_id, message, channel, sender_id, hotel_slug, lang } = req.body;

    if (!session_id || !message) {
      return res.status(400).json({ error: 'session_id and message are required' });
    }

    // Check if handoff lock is active
    const { getSession, setSession } = require('./redis/client');
    const isSilenced = await require('./redis/client').get(`handoff:${session_id}`);
    if (isSilenced) {
      return res.json({ reply: null, ignored: true, reason: 'handoff_active' });
    }

    // Load session from Redis (persists across container restarts)
    let session = await getSession(session_id);
    if (!session) {
      session = { stage: 'start', data: {}, history: [] };
    }

    // Process message through handler router
    const reply = await route(session, message, channel, sender_id, hotel_slug, lang);

    // Persist updated session to Redis with TTL
    const ttl = parseInt(process.env.SESSION_TTL_MINUTES || '60') * 60;
    await setSession(session_id, session, ttl);

    // Log the message event
    const responseMs = Date.now() - startMs;
    const tracker = require('./services/tracker');
    await tracker.logMessageEvent(
      hotel_slug || process.env.HOTEL_SLUG, 
      session_id, 
      channel, 
      session.stage, 
      lang || 'en', 
      responseMs
    );

    return res.json({ reply });
  } catch (err) {
    console.error('[BotEngine] Error:', err.message);
    return res.status(500).json({
      reply: "I'm having a technical issue right now. Please contact us at " +
        (process.env.HOTEL_PHONE || 'reception') + ' and we will be happy to help.'
    });
  }
});

// ── Handoff endpoints ─────────────────────────────────────────
const handoffHandler = require('./handlers/handoff');
app.post('/handoff', (req, res) => handoffHandler.initiateHandoff(req, res));
app.post('/resolve', (req, res) => handoffHandler.resolveHandoff(req, res));


// ── Start server ─────────────────────────────────────────────
const PORT = process.env.BOT_ENGINE_PORT || 3001;
app.listen(PORT, () => {
  console.log(`[BotEngine] Running on port ${PORT} — Hotel: ${process.env.HOTEL_NAME}`);
});
