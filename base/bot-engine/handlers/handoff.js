'use strict';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const redis = require('../redis/client');
const tracker = require('../services/tracker');

class HandoffHandler {
  async initiateHandoff(req, res) {
    const { session_id, channel, client_id, wa_id, tawkto_chat_id, meta_sender_id, reason } = req.body;

    if (!session_id || !channel) {
      return res.status(400).json({ error: 'session_id and channel required' });
    }

    try {
      // 1. Log the handoff event
      await tracker.logHandoffSession(client_id || process.env.HOTEL_SLUG, session_id, channel, reason || 'AI triggered');

      // 2. Set Redis lock to silence the bot
      // The lock automatically expires after 24 hours in case the human forgets to resolve it
      await redis.set(`handoff:${session_id}`, 'true', 'EX', 86400);

      if (channel === 'whatsapp' && wa_id) {
        // Cloud API - we use the handoff lock.
        // Evolution API - call adapter.pauseSession if needed (adapter logic can be called here)
        // For simplicity, the Redis lock covers the bot engine side.
      } 
      else if (channel === 'tawkto' && tawkto_chat_id) {
        // Example: Tawk.to REST API to assign agent (requires proper Tawk.to setup/tokens)
        console.log(`[Handoff] Silenced bot for Tawk.to chat ${tawkto_chat_id}`);
      }
      else if ((channel === 'facebook' || channel === 'instagram') && meta_sender_id) {
        // Meta Handover Protocol
        await this._passMetaThreadControl(meta_sender_id);
      }

      // Widget returns an agent_joining flag in response payload
      return res.json({
        success: true,
        agent_joining: channel === 'website_widget',
        message: 'Handoff initiated successfully'
      });

    } catch (err) {
      console.error('[Handoff] Error initiating handoff:', err);
      return res.status(500).json({ error: 'Internal error during handoff' });
    }
  }

  async resolveHandoff(req, res) {
    const { session_id } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    try {
      await redis.del(`handoff:${session_id}`);
      return res.json({ success: true, message: 'Handoff resolved, bot resumed' });
    } catch (err) {
      console.error('[Handoff] Error resolving handoff:', err);
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  async _passMetaThreadControl(senderId) {
    const pageAccessToken = process.env.META_PAGE_ACCESS_TOKEN;
    const targetAppId = process.env.META_INBOX_APP_ID || '263902037430900'; // Default Page Inbox App ID
    if (!pageAccessToken) {
      console.warn('[Handoff] META_PAGE_ACCESS_TOKEN missing, cannot pass thread control.');
      return;
    }

    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/me/pass_thread_control?access_token=${pageAccessToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: senderId },
          target_app_id: targetAppId,
          metadata: "AI bot passed control to human agent"
        })
      });
      if (!res.ok) {
        console.warn(`[Handoff] Meta pass thread control failed: ${res.status}`);
      }
    } catch (err) {
      console.error('[Handoff] Meta API error:', err);
    }
  }
}

module.exports = new HandoffHandler();
