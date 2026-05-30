'use strict';
const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 3) return null;
    return Math.min(times * 200, 1000);
  }
});

redis.on('connect',      () => console.log('[Redis] Connected'));
redis.on('error',   (err) => console.error('[Redis] Error:', err.message));

// ── Session management ────────────────────────────────────────
const getSession = async (sessionId) => {
  const data = await redis.get(`session:${sessionId}`);
  return data ? JSON.parse(data) : null;
};

const setSession = async (sessionId, data, ttlSeconds) => {
  await redis.setex(`session:${sessionId}`, ttlSeconds, JSON.stringify(data));
};

const deleteSession = async (sessionId) => {
  await redis.del(`session:${sessionId}`);
};

// ── Room hold (atomic soft lock — prevents race conditions) ──
const acquireRoomHold = async (roomId, bookingRef, ttlMinutes) => {
  const key = `room_hold:${roomId}`;
  // SET NX — only succeeds if key does not already exist (atomic)
  const result = await redis.set(key, bookingRef, 'EX', ttlMinutes * 60, 'NX');
  return result === 'OK'; // true = lock acquired | false = already held
};

const releaseRoomHold = async (roomId) => {
  await redis.del(`room_hold:${roomId}`);
};

const isRoomHeld = async (roomId) => {
  return !!(await redis.exists(`room_hold:${roomId}`));
};

// ── Handoff session flag ──────────────────────────────────────
const setHandoffActive = async (sessionId, data, ttlHours = 24) => {
  await redis.setex(`handoff:${sessionId}`, ttlHours * 3600, JSON.stringify(data));
};

const isHandoffActive = async (sessionId) => {
  return !!(await redis.exists(`handoff:${sessionId}`));
};

const clearHandoff = async (sessionId) => {
  await redis.del(`handoff:${sessionId}`);
};

// ── Rate limiting ─────────────────────────────────────────────
const checkRateLimit = async (senderId, maxPerMinute = 20) => {
  const key = `rate:${senderId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 60);
  return count <= maxPerMinute;
};

module.exports = {
  redis,
  getSession, setSession, deleteSession,
  acquireRoomHold, releaseRoomHold, isRoomHeld,
  setHandoffActive, isHandoffActive, clearHandoff,
  checkRateLimit
};
