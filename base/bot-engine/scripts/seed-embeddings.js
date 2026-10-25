'use strict';
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../../platform/.env') });

/**
 * seed-embeddings.js — Zero-Key Local Vector Embedding Seeder
 * 
 * Generates 384-dimensional dense semantic embeddings using local ONNX
 * (@xenova/transformers all-MiniLM-L6-v2) for all active FAQs and rooms in Supabase.
 * Connects securely to Supabase REST API via SUPABASE_SERVICE_ROLE_KEY.
 * Requires ZERO external API keys and incurs $0.00 in API costs.
 */

const supabaseUrl = process.env.SUPABASE_URL || 'https://oieidnsppwooknzofzeq.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('[Seeder] Error: SUPABASE_SERVICE_ROLE_KEY is required.');
  process.exit(1);
}

const headers = {
  'apikey': supabaseKey,
  'Authorization': `Bearer ${supabaseKey}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

let pipelinePromise = null;
async function getExtractor() {
  if (!pipelinePromise) {
    try {
      const { pipeline } = await import('@xenova/transformers');
      console.log('[Seeder] Loading Xenova/all-MiniLM-L6-v2 ONNX model...');
      pipelinePromise = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('[Seeder] ONNX model loaded successfully.');
    } catch (err) {
      console.warn('[Seeder] Could not load @xenova/transformers:', err.message);
      return null;
    }
  }
  return pipelinePromise;
}

async function computeEmbedding(text) {
  const clean = (text || '').replace(/\s+/g, ' ').trim().slice(0, 1000);
  if (!clean) return null;

  try {
    const extractor = await getExtractor();
    if (extractor) {
      const output = await extractor(clean, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    }
  } catch (err) {
    console.error('[Seeder] Extractor error:', err.message);
  }
  return null;
}

async function seed() {
  console.log('[Seeder] Starting Vector Embedding Seeding (384-dim)...');
  const fetch = globalThis.fetch || require('node-fetch');

  try {
    // 1. Fetch FAQs where embedding IS NULL
    const faqGetResp = await fetch(`${supabaseUrl}/rest/v1/faqs?select=id,question,answer,category&embedding=is.null&active=eq.true`, {
      headers
    });
    const faqs = await faqGetResp.json();
    console.log(`[Seeder] Found ${faqs.length} FAQs needing embeddings.`);

    let faqUpdated = 0;
    for (const faq of faqs) {
      const textToEmbed = `Category: ${faq.category || 'general'}\nQuestion: ${faq.question}\nAnswer: ${faq.answer}`;
      const vector = await computeEmbedding(textToEmbed);
      if (vector && vector.length === 384) {
        const vectorStr = `[${vector.join(',')}]`;
        const patchResp = await fetch(`${supabaseUrl}/rest/v1/faqs?id=eq.${faq.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ embedding: vectorStr })
        });
        if (patchResp.ok) {
          faqUpdated++;
          process.stdout.write(`\r[Seeder] Embedded FAQs: ${faqUpdated}/${faqs.length}`);
        } else {
          console.error(`\n[Seeder] Failed to patch FAQ ${faq.id}:`, await patchResp.text());
        }
      }
    }
    console.log(`\n[Seeder] Successfully seeded ${faqUpdated} FAQ embeddings.`);

    // 2. Fetch Rooms where embedding IS NULL
    const roomGetResp = await fetch(`${supabaseUrl}/rest/v1/rooms?select=id,type,rate,capacity,description,amenities&embedding=is.null`, {
      headers
    });
    const rooms = await roomGetResp.json();
    if (!Array.isArray(rooms)) {
      console.error('[Seeder] Rooms query returned non-array:', rooms);
      return;
    }
    console.log(`[Seeder] Found ${rooms.length} Rooms needing embeddings.`);

    let roomUpdated = 0;
    for (const room of rooms) {
      const amenitiesStr = Array.isArray(room.amenities) ? room.amenities.join(', ') : (room.amenities || '');
      const textToEmbed = `Room Type: ${room.type}\nRate: ${room.rate}\nCapacity: ${room.capacity}\nDescription: ${room.description || ''}\nAmenities: ${amenitiesStr}`;
      const vector = await computeEmbedding(textToEmbed);
      if (vector && vector.length === 384) {
        const vectorStr = `[${vector.join(',')}]`;
        const patchResp = await fetch(`${supabaseUrl}/rest/v1/rooms?id=eq.${room.id}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify({ embedding: vectorStr })
        });
        if (patchResp.ok) {
          roomUpdated++;
          process.stdout.write(`\r[Seeder] Embedded Rooms: ${roomUpdated}/${rooms.length}`);
        } else {
          console.error(`\n[Seeder] Failed to patch Room ${room.id}:`, await patchResp.text());
        }
      }
    }
    console.log(`\n[Seeder] Successfully seeded ${roomUpdated} Room embeddings.`);
    console.log('[Seeder] All embeddings seeded successfully! 🎯');

  } catch (err) {
    console.error('[Seeder] Error during seeding:', err.message);
  }
}

seed();
