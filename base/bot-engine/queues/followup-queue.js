'use strict';
const { Queue, Worker } = require('bullmq');
const { redis } = require('../redis/client');

const connection = { client: redis };

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
    console.log(`[FollowUp] Firing for ${senderId} on ${channel}: ${msg}`);
    // TODO: Route through channel-specific send function when channel adapters are wired
  },
  { connection }
);

worker.on('completed', (job) => console.log(`[FollowUp] Job ${job.id} completed`));
worker.on('failed',    (job, err) => console.error(`[FollowUp] Job ${job.id} failed:`, err.message));

module.exports = { scheduleFollowUp, cancelFollowUp };
