'use strict';

const UPSELL_CHAIN = [
  { stage: 'upsell_airport',    env: 'UPSELL_AIRPORT_PICKUP', label: 'airport pickup',     question: (price) => `Would you like to add an airport pickup for just £${price}? Our driver will meet you on arrival. 🚗` },
  { stage: 'upsell_breakfast',  env: 'UPSELL_BREAKFAST',      label: 'breakfast add-on',   question: (price) => `Would you like to include daily breakfast for £${price}/person? Served 7–10 AM in our restaurant. ☕` },
  { stage: 'upsell_extra_bed',  env: 'UPSELL_EXTRA_BED',      label: 'extra bed',          question: (price) => `Do you need an extra bed in your room? We can arrange that for £${price}. 🛏` },
  { stage: 'upsell_romantic',   env: 'UPSELL_ROMANTIC',       label: 'romantic setup',     question: (price) => `Would you like a romantic room setup — rose petals, candles, and Prosecco — for £${price}? 🌹` },
  { stage: 'upsell_spa',        env: 'UPSELL_SPA',            label: 'spa package',        question: (price) => `Finally — would you like a 60-minute couples spa massage for £${price}? 🧖` },
];

const handle = async (session, message) => {
  const msg = message.toLowerCase().trim();
  const accepted = msg.includes('yes') || msg.includes('yeah') || msg === 'y' || msg.includes('sure') || msg.includes('ok');

  const currentIndex = UPSELL_CHAIN.findIndex(u => u.stage === session.stage);

  if (accepted) {
    const current = UPSELL_CHAIN[currentIndex];
    const price = process.env[current.env] || '?';
    if (!session.data.upsells) session.data.upsells = [];
    session.data.upsells.push({ label: current.label, price: parseFloat(price) });
  }

  // Move to next upsell
  const next = UPSELL_CHAIN[currentIndex + 1];
  if (next) {
    const price = process.env[next.env] || '?';
    session.stage = next.stage;
    return next.question(price);
  }

  // All upsells done — complete booking
  session.stage = 'completed';
  const upsellSummary = session.data.upsells && session.data.upsells.length > 0
    ? '\n\nExtras added:\n' + session.data.upsells.map(u => `• ${u.label} — £${u.price}`).join('\n')
    : '';

  return `All set! 🎉 Your booking is fully confirmed.\n\nBooking Ref: ${session.data.bookingRef}${upsellSummary}\n\nWe look forward to welcoming you. If you need anything before your stay, just message us here!`;
};

module.exports = { handle };
