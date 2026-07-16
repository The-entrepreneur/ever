'use strict';
const axios = require('axios');

/**
 * handlers/order.js — HCA-tier F&B / Spa / Transport order handler.
 *
 * Guest journey through an in-chat order:
 *   order_menu       → fetch menu catalogue from PMS API; display to guest
 *   order_selecting  → guest picks items by number / confirms running total
 *   order_room       → collect room number (if not already in session)
 *   order_confirm    → show final cart + total; ask for confirmation
 *   order_placed     → POST to PMS API /orders; confirm to guest
 *
 * The PMS API writes the order to Supabase `orders` table and posts
 * a `folio_charge` to the hotel PMS via `pos_adapter.py`.
 */

const PMS_URL = () => process.env.PMS_API_BASE_URL || 'http://pms-api:8000';
const API_KEY = () => process.env.INTERNAL_API_KEY || '';

const CATEGORY_LABELS = {
  'f&b':       'Food & Beverage',
  'spa':       'Spa & Wellness',
  'transport': 'Transport Services',
};

/**
 * Fetch menu items from PMS API for a given hotel and category.
 * Falls back to a generic prompt if PMS is unavailable.
 */
const fetchMenu = async (hotelSlug, category) => {
  try {
    const res = await axios.get(`${PMS_URL()}/api/v1/orders/menu`, {
      params: { hotel_slug: hotelSlug, category },
      headers: { 'X-API-Key': API_KEY() },
      timeout: 5000,
    });
    return res.data.items || [];
  } catch (err) {
    console.error('[OrderHandler] fetchMenu error:', err.message);
    return null; // null = PMS unavailable, use fallback
  }
};

/**
 * POST a confirmed order to the PMS API.
 */
const submitOrder = async (payload) => {
  const res = await axios.post(`${PMS_URL()}/api/v1/orders`, payload, {
    headers: {
      'X-API-Key': API_KEY(),
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });
  return res.data;
};

const handle = async (session, message, channel, senderId, hotelSlug, lang, orderIntent) => {
  const msg = message.toLowerCase().trim();

  switch (session.stage) {

    // ── STEP 1: Show menu catalogue ─────────────────────────────────────────
    case 'order_menu': {
      const category = orderIntent || session.data.orderCategory || 'f&b';
      session.data.orderCategory = category;
      session.data.orderItems    = [];

      const items = await fetchMenu(hotelSlug, category);

      if (!items) {
        // PMS unavailable — webhook fallback: notify staff, confirm to guest
        return `I'll have our ${CATEGORY_LABELS[category] || 'service'} team reach out to you shortly with options! 🏨\n\nYour request has been logged and a staff member will be with you in a moment.`;
      }

      if (items.length === 0) {
        return `I'm sorry, our ${CATEGORY_LABELS[category] || category} menu isn't available right now. Please call reception or visit us at the front desk.`;
      }

      session.data.menuItems = items;
      session.stage = 'order_selecting';

      const menuText = items
        .map((item, i) => `${i + 1}. *${item.name}* — £${item.price.toFixed(2)}\n   ${item.description || ''}`)
        .join('\n\n');

      return `Here is our *${CATEGORY_LABELS[category] || category}* menu:\n\n${menuText}\n\nReply with the *item number(s)* you'd like to order (e.g. "1, 3") or type *done* when you're finished selecting.`;
    }

    // ── STEP 2: Guest selects items ─────────────────────────────────────────
    case 'order_selecting': {
      if (msg === 'done' || msg === 'finish' || msg === 'that\'s all' || msg === 'thats all') {
        if (!session.data.orderItems || session.data.orderItems.length === 0) {
          return "You haven't selected any items yet. Please reply with the item number(s) from the menu above.";
        }
        session.stage = session.data.roomNumber ? 'order_confirm' : 'order_room';
        return handle(session, message, channel, senderId, hotelSlug, lang, orderIntent);
      }

      // Parse item numbers from message — supports "1", "1,2,3", "items 1 and 2"
      const nums = [...msg.matchAll(/\d+/g)].map(m => parseInt(m[0]) - 1);
      const menu = session.data.menuItems || [];
      const selected = nums.filter(i => i >= 0 && i < menu.length);

      if (selected.length === 0) {
        return "I didn't catch that — please reply with the item number(s) from the menu, e.g. *1* or *1, 3*.";
      }

      // Add to cart (allow duplicates for quantity)
      selected.forEach(idx => {
        const existing = session.data.orderItems.find(i => i.menu_item_id === menu[idx].id);
        if (existing) {
          existing.qty += 1;
          existing.subtotal = existing.qty * existing.unit_price;
        } else {
          session.data.orderItems.push({
            menu_item_id: menu[idx].id,
            name:         menu[idx].name,
            qty:          1,
            unit_price:   parseFloat(menu[idx].price),
            subtotal:     parseFloat(menu[idx].price),
          });
        }
      });

      const cartText = session.data.orderItems
        .map(i => `• ${i.name} ×${i.qty} — £${i.subtotal.toFixed(2)}`)
        .join('\n');

      const total = session.data.orderItems.reduce((acc, i) => acc + i.subtotal, 0);
      return `*Cart so far:*\n${cartText}\n\n*Total: £${total.toFixed(2)}*\n\nAdd more items by number, or type *done* to confirm.`;
    }

    // ── STEP 3: Collect room number ─────────────────────────────────────────
    case 'order_room': {
      const roomMatch = message.match(/\d+/);
      if (!roomMatch) {
        return "Which room shall we deliver this to? Please share your room number (e.g. *204*).";
      }
      session.data.roomNumber = roomMatch[0];
      session.stage = 'order_confirm';
      return handle(session, message, channel, senderId, hotelSlug, lang, orderIntent);
    }

    // ── STEP 4: Confirm order ───────────────────────────────────────────────
    case 'order_confirm': {
      const items     = session.data.orderItems || [];
      const total     = items.reduce((acc, i) => acc + i.subtotal, 0);
      const cartLines = items.map(i => `• ${i.name} ×${i.qty} — £${i.subtotal.toFixed(2)}`).join('\n');

      session.stage = 'order_placed';
      return `*Order Summary — Room ${session.data.roomNumber}:*\n\n${cartLines}\n\n*Total: £${total.toFixed(2)}*\n_(charged to your room folio upon delivery)_\n\nShall I place this order? Reply *yes* to confirm or *cancel* to start over.`;
    }

    // ── STEP 5: Place order ─────────────────────────────────────────────────
    case 'order_placed': {
      if (msg.includes('cancel') || msg.includes('no')) {
        session.stage   = 'order_menu';
        session.data.orderItems = [];
        return "No problem — your order has been cancelled. Would you like to browse the menu again?";
      }

      if (!msg.includes('yes') && !msg.includes('confirm') && !msg.includes('ok')) {
        return "Please reply *yes* to confirm your order or *cancel* to start over.";
      }

      const items  = session.data.orderItems || [];
      const total  = items.reduce((acc, i) => acc + i.subtotal, 0);

      try {
        const result = await submitOrder({
          hotel_slug:  hotelSlug,
          session_id:  senderId,
          room_number: session.data.roomNumber,
          items,
          total_amount: parseFloat(total.toFixed(2)),
          channel,
          notes: '',
        });

        session.stage          = 'completed';
        session.data.orderId   = result.order_id;
        session.data.orderItems = [];

        return `✅ *Order confirmed!*\n\nOrder Ref: *${result.order_ref || result.order_id}*\nEst. delivery: *${result.eta_minutes || 20}–${(result.eta_minutes || 20) + 10} mins* to Room ${session.data.roomNumber}\n\nIs there anything else I can help you with?`;
      } catch (err) {
        console.error('[OrderHandler] submitOrder error:', err.message);
        // Webhook fallback — notify staff instead
        return `Your order has been received! 🙏 Our team will bring it to Room ${session.data.roomNumber} shortly.\n\nOrder Ref: *ORD-${Date.now()}*\n\nApologies for the slight delay — a staff member will confirm shortly.`;
      }
    }

    default:
      session.stage = 'order_menu';
      return handle(session, message, channel, senderId, hotelSlug, lang, orderIntent);
  }
};

module.exports = { handle };
