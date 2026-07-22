import { Router } from "express";
import webpush from "web-push";
import { vapidKeys, localCache } from "../lib/globals.js";

const router = Router();

router.get("/vapid-public-key", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

router.post("/subscribe", (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: "Invalid subscription" });
  }
  
  // De-duplicate subscriptions
  const exists = localCache.pushSubscriptions.some(sub => sub.endpoint === subscription.endpoint);
  if (!exists) {
    localCache.pushSubscriptions.push(subscription);
    console.log(`[Web Push] New subscription added. Total: ${localCache.pushSubscriptions.length}`);
  }
  res.status(201).json({ success: true });
});

router.post("/send-notification", async (req, res) => {
  const { title, body, icon, data } = req.body;
  
  const payload = JSON.stringify({
    notification: {
      title: title || "Ever Notification",
      body: body || "New update in operating hub.",
      icon: icon || "/icon-192.png",
      data: data || {}
    }
  });

  let successCount = 0;
  let failCount = 0;

  const promises = localCache.pushSubscriptions.map(async (sub, index) => {
    try {
      await webpush.sendNotification(sub, payload);
      successCount++;
    } catch (err: any) {
      console.warn(`[Web Push] Failed to send notification to subscription ${index}:`, err?.message || err);
      failCount++;
      if (err.statusCode === 410 || err.statusCode === 404) {
        localCache.pushSubscriptions.splice(index, 1);
      }
    }
  });

  await Promise.all(promises);
  res.json({ success: true, sent: successCount, failed: failCount });
});

export default router;
