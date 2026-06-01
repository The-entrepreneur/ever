/**
 * Hotel Chatbot Widget
 * Agency: [Your Agency Name]
 * Version: 1.0.0
 *
 * Drop-in embeddable chat widget for hotel clients.
 * Connects to n8n webhook backend. No dependencies.
 */

(function () {
  'use strict';

  // ─── CONFIG ────────────────────────────────────────────────────────────────
  const script   = document.currentScript;
  const CONFIG   = {
    hotelSlug  : script.getAttribute('data-hotel')    || 'hotel',
    webhook    : script.getAttribute('data-webhook')  || '',
    color      : script.getAttribute('data-color')    || '#1E90FF',
    name       : script.getAttribute('data-name')     || 'Hotel Concierge',
    logo       : script.getAttribute('data-logo')     || '',
    position   : script.getAttribute('data-position') || 'right',
    greeting   : script.getAttribute('data-greeting') || 'Hello! How can I assist you today?',
    theme      : script.getAttribute('data-theme')    || 'light',
    lang       : script.getAttribute('data-lang')     || 'en',
  };

  // Derive dark color from primary for hover states
  const darken = (hex, pct) => {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (n >> 16) - pct);
    const g = Math.max(0, ((n >> 8) & 0xff) - pct);
    const b = Math.max(0, (n & 0xff) - pct);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  };
  const COLOR_DARK = darken(CONFIG.color, 30);

  // ─── STATE ─────────────────────────────────────────────────────────────────
  const STATE = {
    isOpen     : false,
    messages   : [],
    sessionId  : `session_${CONFIG.hotelSlug}_${Date.now()}`,
    isTyping   : false,
    hasGreeted : false,
  };

  // ─── STYLES ────────────────────────────────────────────────────────────────
  const isDark = CONFIG.theme === 'dark';
  const BG     = isDark ? '#0D1B2A'  : '#FFFFFF';
  const BG2    = isDark ? '#132236'  : '#F4F6F9';
  const TEXT   = isDark ? '#EDF4FF'  : '#1A202C';
  const SUBTEXT= isDark ? '#6B7C93'  : '#718096';
  const BORDER = isDark ? '#1A2E44'  : '#E2E8F0';

  const STYLES = `
    #hcw-container * { box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; }

    #hcw-bubble {
      position: fixed;
      ${CONFIG.position}: 24px;
      bottom: 24px;
      width: 56px; height: 56px;
      border-radius: 50%;
      background: ${CONFIG.color};
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      transition: transform 0.2s, box-shadow 0.2s;
      z-index: 999999;
      border: none;
    }
    #hcw-bubble:hover { transform: scale(1.08); box-shadow: 0 6px 28px rgba(0,0,0,0.3); }
    #hcw-bubble svg { width: 26px; height: 26px; fill: white; }

    #hcw-badge {
      position: absolute;
      top: -2px; right: -2px;
      width: 16px; height: 16px;
      background: #FF4C4C;
      border-radius: 50%;
      border: 2px solid white;
      display: none;
    }

    #hcw-window {
      position: fixed;
      ${CONFIG.position}: 24px;
      bottom: 92px;
      width: 360px;
      height: 520px;
      background: ${BG};
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.18);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 999998;
      border: 1px solid ${BORDER};
      animation: hcw-slidein 0.22s ease;
    }
    @keyframes hcw-slidein {
      from { opacity: 0; transform: translateY(16px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }

    #hcw-header {
      background: ${CONFIG.color};
      padding: 14px 16px;
      display: flex; align-items: center; gap: 10px;
      flex-shrink: 0;
    }
    #hcw-header-logo {
      width: 36px; height: 36px; border-radius: 50%;
      object-fit: cover; background: rgba(255,255,255,0.2);
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; flex-shrink: 0; overflow: hidden;
    }
    #hcw-header-logo img { width: 100%; height: 100%; object-fit: cover; }
    #hcw-header-info { flex: 1; }
    #hcw-header-name { color: white; font-weight: 700; font-size: 14px; }
    #hcw-header-status { display: flex; align-items: center; gap: 5px; margin-top: 2px; }
    #hcw-status-dot { width: 7px; height: 7px; border-radius: 50%; background: #4ADE80; }
    #hcw-header-status span { color: rgba(255,255,255,0.85); font-size: 11px; }
    #hcw-close {
      background: rgba(255,255,255,0.2); border: none; border-radius: 50%;
      width: 28px; height: 28px; cursor: pointer; color: white;
      display: flex; align-items: center; justify-content: center; font-size: 16px;
      transition: background 0.15s;
    }
    #hcw-close:hover { background: rgba(255,255,255,0.35); }

    #hcw-messages {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 10px;
      scroll-behavior: smooth;
    }
    #hcw-messages::-webkit-scrollbar { width: 4px; }
    #hcw-messages::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 2px; }

    .hcw-msg { display: flex; flex-direction: column; max-width: 80%; }
    .hcw-msg.bot  { align-self: flex-start; }
    .hcw-msg.user { align-self: flex-end; }

    .hcw-bubble-text {
      padding: 9px 13px;
      border-radius: 14px;
      font-size: 13px;
      line-height: 1.5;
      word-break: break-word;
      white-space: pre-wrap;
    }
    .hcw-msg.bot  .hcw-bubble-text { background: ${BG2}; color: ${TEXT}; border-radius: 14px 14px 14px 4px; border: 1px solid ${BORDER}; }
    .hcw-msg.user .hcw-bubble-text { background: ${CONFIG.color}; color: white; border-radius: 14px 14px 4px 14px; }

    .hcw-time { font-size: 10px; color: ${SUBTEXT}; margin-top: 3px; }
    .hcw-msg.user .hcw-time { text-align: right; }

    .hcw-typing {
      display: flex; align-items: center; gap: 4px;
      padding: 9px 13px;
      background: ${BG2}; border: 1px solid ${BORDER};
      border-radius: 14px 14px 14px 4px;
      width: fit-content;
    }
    .hcw-typing span {
      width: 6px; height: 6px; border-radius: 50%;
      background: ${SUBTEXT};
      animation: hcw-bounce 1.2s infinite;
    }
    .hcw-typing span:nth-child(2) { animation-delay: 0.2s; }
    .hcw-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes hcw-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    #hcw-suggestions {
      padding: 6px 14px 0;
      display: flex; gap: 6px; flex-wrap: wrap;
    }
    .hcw-suggestion {
      background: transparent;
      border: 1px solid ${CONFIG.color}66;
      color: ${CONFIG.color};
      border-radius: 20px;
      padding: 4px 11px;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
    }
    .hcw-suggestion:hover { background: ${CONFIG.color}18; }

    #hcw-input-area {
      padding: 10px 14px 14px;
      display: flex; gap: 8px;
      border-top: 1px solid ${BORDER};
      flex-shrink: 0;
    }
    #hcw-input {
      flex: 1;
      background: ${BG2};
      border: 1px solid ${BORDER};
      border-radius: 22px;
      padding: 9px 14px;
      color: ${TEXT};
      font-size: 13px;
      outline: none;
      resize: none;
      transition: border-color 0.15s;
      line-height: 1.4;
    }
    #hcw-input:focus { border-color: ${CONFIG.color}; }
    #hcw-input::placeholder { color: ${SUBTEXT}; }
    #hcw-send {
      width: 38px; height: 38px; border-radius: 50%;
      background: ${CONFIG.color};
      border: none; cursor: pointer; color: white;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; align-self: flex-end;
      transition: background 0.15s, transform 0.1s;
    }
    #hcw-send:hover { background: ${COLOR_DARK}; transform: scale(1.05); }
    #hcw-send:disabled { background: ${BORDER}; cursor: default; transform: none; }
    #hcw-send svg { width: 16px; height: 16px; fill: white; }

    #hcw-powered {
      text-align: center; padding: 5px 0 10px;
      font-size: 10px; color: ${SUBTEXT};
      flex-shrink: 0;
    }
    #hcw-powered a { color: ${CONFIG.color}; text-decoration: none; }

    @media (max-width: 420px) {
      #hcw-window { width: calc(100vw - 16px); ${CONFIG.position}: 8px; bottom: 82px; height: 70vh; }
      #hcw-bubble { ${CONFIG.position}: 16px; bottom: 16px; }
    }
  `;

  // ─── HELPERS ───────────────────────────────────────────────────────────────
  const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const el = (tag, attrs = {}, children = []) => {
    const e = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => {
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else e.setAttribute(k, v);
    });
    children.forEach(c => c && e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return e;
  };

  // ─── DOM BUILDER ───────────────────────────────────────────────────────────
  const buildWidget = () => {
    // Inject styles
    const styleTag = el('style', { html: STYLES });
    document.head.appendChild(styleTag);

    // Container
    const container = el('div', { id: 'hcw-container' });

    // Bubble
    const bubble = el('button', { id: 'hcw-bubble', 'aria-label': 'Open chat' });
    bubble.innerHTML = `<svg viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>`;
    const badge = el('div', { id: 'hcw-badge' });
    bubble.appendChild(badge);

    // Window
    const win = el('div', { id: 'hcw-window', role: 'dialog', 'aria-label': 'Chat window' });

    // Header
    const header = el('div', { id: 'hcw-header' });
    const logoDiv = el('div', { id: 'hcw-header-logo' });
    if (CONFIG.logo) {
      const img = el('img', { src: CONFIG.logo, alt: CONFIG.name });
      logoDiv.appendChild(img);
    } else {
      logoDiv.textContent = '🏨';
    }
    const info = el('div', { id: 'hcw-header-info' });
    const name = el('div', { id: 'hcw-header-name', text: CONFIG.name });
    const statusRow = el('div', { id: 'hcw-header-status' });
    const dot = el('div', { id: 'hcw-status-dot' });
    const statusText = el('span', { text: 'Online — Concierge Assistant' });
    statusRow.append(dot, statusText);
    info.append(name, statusRow);
    const closeBtn = el('button', { id: 'hcw-close', 'aria-label': 'Close chat', html: '✕' });
    header.append(logoDiv, info, closeBtn);

    // Messages area
    const messages = el('div', { id: 'hcw-messages', role: 'log', 'aria-live': 'polite' });

    // Suggestions
    const suggestions = el('div', { id: 'hcw-suggestions' });
    const SUGGESTIONS = [
      'Check-in time?',
      'Room rates',
      'Book a room',
      'Parking info',
    ];
    SUGGESTIONS.forEach(text => {
      const btn = el('button', { class: 'hcw-suggestion', text });
      btn.addEventListener('click', () => {
        sendMessage(text);
        suggestions.style.display = 'none';
      });
      suggestions.appendChild(btn);
    });

    // Input area
    const inputArea = el('div', { id: 'hcw-input-area' });
    const input = el('textarea', { id: 'hcw-input', placeholder: 'Type a message...', rows: '1', 'aria-label': 'Message input' });
    const sendBtn = el('button', { id: 'hcw-send', 'aria-label': 'Send message', disabled: 'true' });
    sendBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
    inputArea.append(input, sendBtn);

    // Powered by
    const powered = el('div', { id: 'hcw-powered' });
    powered.innerHTML = `Powered by <a href="#" target="_blank">[Your Agency]</a>`;

    win.append(header, messages, suggestions, inputArea, powered);
    container.append(bubble, win);
    document.body.appendChild(container);

    return { bubble, win, messages, input, sendBtn, suggestions };
  };

  // ─── MESSAGE RENDERER ──────────────────────────────────────────────────────
  const renderMessage = (messagesEl, role, text) => {
    const wrapper = el('div', { class: `hcw-msg ${role}` });
    const bubble  = el('div', { class: 'hcw-bubble-text', text });
    const time    = el('div', { class: 'hcw-time', text: formatTime() });
    wrapper.append(bubble, time);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return wrapper;
  };

  const showTyping = (messagesEl) => {
    const wrapper = el('div', { class: 'hcw-msg bot', id: 'hcw-typing-indicator' });
    const typing  = el('div', { class: 'hcw-typing' });
    typing.append(el('span'), el('span'), el('span'));
    wrapper.appendChild(typing);
    messagesEl.appendChild(wrapper);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  const hideTyping = () => {
    const t = document.getElementById('hcw-typing-indicator');
    if (t) t.remove();
  };

  // ─── SEND MESSAGE ──────────────────────────────────────────────────────────
  let sendMessage;

  const init = () => {
    const { bubble, win, messages, input, sendBtn, suggestions } = buildWidget();

    // Toggle open/close
    const toggle = (open) => {
      STATE.isOpen = open;
      win.style.display   = open ? 'flex' : 'none';
      bubble.innerHTML    = open
        ? `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`
        : `<svg viewBox="0 0 24 24"><path d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg><div id="hcw-badge" style="display:none"></div>`;

      // Show greeting on first open
      if (open && !STATE.hasGreeted) {
        STATE.hasGreeted = true;
        setTimeout(() => {
          renderMessage(messages, 'bot', CONFIG.greeting);
        }, 300);
      }

      if (open) input.focus();
    };

    bubble.addEventListener('click', () => toggle(!STATE.isOpen));
    document.getElementById('hcw-close').addEventListener('click', () => toggle(false));

    // Input handling
    input.addEventListener('input', () => {
      sendBtn.disabled = !input.value.trim();
      input.style.height = 'auto';
      input.style.height = Math.min(input.scrollHeight, 96) + 'px';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) sendMessage(input.value.trim());
      }
    });

    sendBtn.addEventListener('click', () => {
      if (!sendBtn.disabled) sendMessage(input.value.trim());
    });

    // ── CORE SEND FUNCTION ──
    sendMessage = async (text) => {
      if (!text || STATE.isTyping) return;

      // Render user message
      renderMessage(messages, 'user', text);
      input.value = '';
      input.style.height = 'auto';
      sendBtn.disabled = true;
      suggestions.style.display = 'none';

      // Show typing
      STATE.isTyping = true;
      showTyping(messages);

      try {
        const response = await fetch(CONFIG.webhook, {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({
            session_id : STATE.sessionId,
            hotel_slug : CONFIG.hotelSlug,
            message    : text,
            channel    : 'website_widget',
            lang       : CONFIG.lang,
            timestamp  : new Date().toISOString(),
          }),
        });

        const data = await response.json();
        hideTyping();

        if (data.agent_joining) {
          document.getElementById('hcw-header-name').textContent = 'Live Support';
          document.querySelector('#hcw-header-status span').textContent = 'Connecting to a team member...';
          document.getElementById('hcw-status-dot').style.background = '#FFA500'; // Orange
        }

        // n8n returns { reply: "..." } or { message: "..." }
        const reply = data.reply || data.message || data.text || 'I received your message. Let me look into that for you.';
        if (reply) {
          renderMessage(messages, 'bot', reply);
        }

      } catch (err) {
        hideTyping();
        renderMessage(messages, 'bot', 'Sorry, I\'m having trouble connecting right now. Please try again or call us directly.');
        console.warn('[HCW] Webhook error:', err);
      }

      STATE.isTyping = false;
    };
  };

  // ─── BOOT ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
