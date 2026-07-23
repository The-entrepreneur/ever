'use strict';
require('dotenv').config();

const express = require('express');
const { getSession, setSession } = require('./redis/client');
const { route, routeHCA } = require('./handlers/router');

const app = express();
app.use(express.json());

// ── Health check ─────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// ── Main message endpoint — called by n8n bot engine proxy ───
app.post('/message', async (req, res) => {
  const startMs = Date.now();
  try {
    const {
      session_id, message, channel, sender_id, hotel_slug, lang,
      // HCA-tier intent flags injected by the HCA n8n workflow's Bot Engine Proxy node
      order_intent   = null,
      service_intent = null,
      booking_intent = false,
    } = req.body;

    if (!session_id || !message) {
      return res.status(400).json({ error: 'session_id and message are required' });
    }

    // Check if handoff lock is active
    const { isHandoffActive } = require('./redis/client');
    const isSilenced = await isHandoffActive(session_id);
    if (isSilenced) {
      return res.json({ reply: null, ignored: true, reason: 'handoff_active' });
    }

    // Load session from Redis (persists across container restarts)
    let session = await getSession(session_id);
    if (!session) {
      session = { stage: 'start', data: {}, history: [] };
    }

    // Route through HCA if any intent flag is present; otherwise use GCE route
    const isHCARequest = order_intent || service_intent || booking_intent;
    const reply = isHCARequest
      ? await routeHCA(session, message, channel, sender_id, hotel_slug, lang,
                       order_intent, service_intent, booking_intent)
      : await route(session, message, channel, sender_id, hotel_slug, lang);

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

// ── Payment confirmation endpoint ────────────────────────────
app.post('/payment/confirm', async (req, res) => {
  const { session_id, booking_id, amount, payment_ref } = req.body;
  if (!session_id || !booking_id) {
    return res.status(400).json({ error: 'session_id and booking_id are required' });
  }

  try {
    const PMSAdapter = require('./adapters/pms-adapter');
    const pms = new PMSAdapter(process.env.PMS_TYPE || 'native', {
      pmsBaseUrl: process.env.PMS_API_BASE_URL,
      internalApiKey: process.env.INTERNAL_API_KEY,
    });
    
    await pms.processPayment({
      booking_id,
      payment_ref: payment_ref || `PAY-${Date.now()}`,
      amount: parseFloat(amount || 0),
    });

    let session = await getSession(session_id);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const { cancelFollowUp } = require('./queues/followup-queue');
    await cancelFollowUp(session_id);

    const { releaseRoomHold } = require('./redis/client');
    if (session.data && session.data.selectedRoom) {
      await releaseRoomHold(session.data.selectedRoom.id);
    }

    const tracker = require('./services/tracker');
    await tracker.logBookingEvent(
      process.env.HOTEL_SLUG || 'grand-horizon',
      booking_id,
      session.data.guestName || 'Guest',
      (session.data.selectedRoom && session.data.selectedRoom.type) || 'Room',
      parseFloat(amount || (session.data.selectedRoom && session.data.selectedRoom.rate) || 0),
      'confirmed'
    );

    const upsellHandler = require('./handlers/upsell');
    const upsellPrompt = await upsellHandler.handle(session, '');
    
    const ttl = parseInt(process.env.SESSION_TTL_MINUTES || '60') * 60;
    await setSession(session_id, session, ttl);

    const confirmationText = `Payment confirmed! 🎉 Your booking is fully verified.\n\nBooking Ref: ${session.data.bookingRef}\n\n`;
    const reply = confirmationText + upsellPrompt;

    return res.json({ success: true, reply });
  } catch (err) {
    console.error('[BotEngine] Payment confirmation error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── Lead logging endpoint ────────────────────────────────────
app.post('/lead', async (req, res) => {
  const { session_id, hotel_slug, name, email, phone, checkin, checkout, channel } = req.body;
  try {
    const leadHandler = require('./handlers/lead');
    await leadHandler.saveLead({ session_id, hotel_slug, name, email, phone, checkin, checkout, channel });
    return res.json({ success: true });
  } catch (err) {
    console.error('[BotEngine] Save lead error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});


// ── Start server ─────────────────────────────────────────────
const PORT = process.env.BOT_ENGINE_PORT || 3001;
app.listen(PORT, () => {
  console.log(`[BotEngine] Running on port ${PORT} — Hotel: ${process.env.HOTEL_NAME}`);
});
