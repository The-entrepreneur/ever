'use strict';
const { Queue, Worker } = require('bullmq');

// BullMQ requires its own connection config — not a shared ioredis client
const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const redisUrl   = new URL(REDIS_URL);
const connection = {
  host:     redisUrl.hostname,
  port:     parseInt(redisUrl.port) || 6379,
  password: redisUrl.password || undefined,
  tls:      redisUrl.protocol === 'rediss:' ? {} : undefined,
};

const followUpQueue = new Queue('follow-up', { connection });

// Schedule a follow-up job — survives container restarts
const scheduleFollowUp = async (jobId, channel, senderId, delayMinutes) => {
  await followUpQueue.add(
    'send-reminder',
    {
      channel,
      senderId,
      discountCode: process.env.DISCOUNT_CODE || 'SAVE10',
      bookingUrl: process.env.HOTEL_BOOKING_URL,
      hotelName: process.env.HOTEL_NAME,
    },
    {
      delay: delayMinutes * 60 * 1000,
      jobId: `followup_${jobId}`,       // idempotent — prevents duplicate jobs
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
  console.log(`[FollowUp] Scheduled for ${jobId} in ${delayMinutes} mins`);
};

// Cancel if guest completes booking before delay fires
const cancelFollowUp = async (jobId) => {
  const job = await followUpQueue.getJob(`followup_${jobId}`);
  if (job) {
    await job.remove();
    console.log(`[FollowUp] Cancelled for ${jobId}`);
  }
};

// Worker — processes job when delay expires
const worker = new Worker(
  'follow-up',
  async (job) => {
    const { channel, senderId, discountCode, bookingUrl, hotelName } = job.data;
    const msg = `Hi! This is ${hotelName} — you were looking at booking a room with us. Still thinking? Use code ${discountCode} for 10% off. Book here: ${bookingUrl} 🏨`;
    console.log(`[FollowUp] Firing for ${senderId} on ${channel}`);

    // Route through channel adapter
    try {
      if (channel === 'whatsapp') {
        const wa = require('../adapters/whatsapp-adapter');
        await wa.sendMessage(senderId, msg);
      } else if (channel === 'facebook' || channel === 'instagram') {
        const meta = require('../adapters/meta-adapter');
        await meta.sendMessage(senderId, msg);
      } else if (channel === 'tawkto') {
        const tawkto = require('../adapters/tawkto-adapter');
        await tawkto.sendMessage(senderId, msg);
      } else if (channel === 'website_widget') {
        const widget = require('../adapters/widget-adapter');
        await widget.sendMessage(senderId, msg);
      } else {
        console.log(`[FollowUp] Message for unsupported channel ${channel}:`, msg);
      }
    } catch (err) {
      console.error(`[FollowUp] Dispatch error on ${channel}:`, err.message);
      throw err; // re-throw so BullMQ marks job as failed for retry
    }
  },
  { connection }
);

worker.on('completed', (job) => console.log(`[FollowUp] Job ${job.id} completed`));
worker.on('failed',    (job, err) => console.error(`[FollowUp] Job ${job.id} failed:`, err.message));

module.exports = { scheduleFollowUp, cancelFollowUp };
