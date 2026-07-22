'use strict';
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { setHandoffActive, clearHandoff } = require('../redis/client');
const tracker = require('../services/tracker');

// OpenBSP channels — pausing is handled natively via the REST API, not Redis
const OPENBSP_CHANNELS = new Set(['whatsapp', 'instagram']);

/**
 * Calls OpenBSP PATCH /rest/v1/conversations to toggle the bot pause flag.
 * @param {string} channel_id   - The OpenBSP conversation/channel ID
 * @param {boolean} paused      - true = pause bot | false = resume bot
 */
async function setOpenBSPConversationPause(channel_id, paused) {
  const baseUrl = process.env.OPENBSP_API_URL;
  const apiKey  = process.env.OPENBSP_OWNER_API_KEY;

  if (!baseUrl || !apiKey) {
    console.warn('[Handoff] OPENBSP_API_URL or OPENBSP_OWNER_API_KEY not set — skipping native pause.');
    return;
  }

  const res = await fetch(`${baseUrl}/rest/v1/conversations`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({ id: channel_id, paused }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.warn(`[Handoff] OpenBSP pause update failed (${res.status}): ${text}`);
  } else {
    console.log(`[Handoff] OpenBSP conversation ${channel_id} paused=${paused}`);
  }
}

class HandoffHandler {
  async initiateHandoff(req, res) {
    const { session_id, channel, client_id, wa_id, tawkto_chat_id, meta_sender_id, reason } = req.body;

    if (!session_id || !channel) {
      return res.status(400).json({ error: 'session_id and channel required' });
    }

    try {
      // 1. Log the handoff event
      await tracker.logHandoffSession(client_id || process.env.HOTEL_SLUG, session_id, channel, reason || 'AI triggered');

      if (OPENBSP_CHANNELS.has(channel)) {
        // 2a. OpenBSP channels (WhatsApp / Instagram):
        //     Use the native REST pause — no Redis lock needed, OpenBSP handles this natively.
        const openbsp_channel_id = req.body.openbsp_channel_id || wa_id || meta_sender_id;
        if (openbsp_channel_id) {
          await setOpenBSPConversationPause(openbsp_channel_id, true);
        } else {
          console.warn(`[Handoff] OpenBSP channel handoff for '${channel}' missing openbsp_channel_id.`);
        }
      } else {
        // 2b. Non-OpenBSP channels: use Redis lock to silence the bot
        await setHandoffActive(session_id, 'true', 24);

        if (channel === 'tawkto' && tawkto_chat_id) {
          // Tawk.to REST API to assign agent (requires proper Tawk.to setup/tokens)
          console.log(`[Handoff] Silenced bot for Tawk.to chat ${tawkto_chat_id}`);
        }
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
    const { session_id, channel } = req.body;
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    try {
      if (OPENBSP_CHANNELS.has(channel)) {
        // OpenBSP channels: resume via native REST API
        const openbsp_channel_id = req.body.openbsp_channel_id;
        if (openbsp_channel_id) {
          await setOpenBSPConversationPause(openbsp_channel_id, false);
        }
      } else {
        // Non-OpenBSP: clear the Redis lock to resume the bot
        await clearHandoff(session_id);
      }
      return res.json({ success: true, message: 'Handoff resolved, bot resumed' });
    } catch (err) {
      console.error('[Handoff] Error resolving handoff:', err);
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  /**
   * _passMetaThreadControl is kept for Facebook-only (non-OpenBSP) integrations.
   * Instagram handoff is now handled natively via OpenBSP PATCH /rest/v1/conversations.
   */
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
          metadata: 'AI bot passed control to human agent'
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
