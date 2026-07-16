// Ever Platform Service Worker for Push Notifications and PWA
const CACHE_NAME = "ever-cache-v1";
const ASSETS_TO_CACHE = [
  "/console",
  "/favicon.svg",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        // Allow install even if caching individual page fails
        console.log("Caching initial assets completed");
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Handle incoming Web Push notifications
self.addEventListener("push", (event) => {
  let data = { title: "Ever Update", body: "New activity detected." };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      data = { title: "Ever Notification", body: event.data.text() };
    }
  }

  // If a notification contains custom options, merge them
  const options = {
    body: data.notification?.body || data.body || "New activity detected.",
    icon: data.notification?.icon || "/favicon.svg",
    badge: "/favicon.svg",
    vibrate: [100, 50, 100],
    data: data.notification?.data || data.data || {},
    actions: [
      { action: "open", title: "Open Console" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.notification?.title || data.title || "Ever Notification",
      options
    )
  );
});

// Handle notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Find if we already have the Ever Console window open
      for (const client of clientList) {
        if (client.url.includes("/console") && "focus" in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow("/console");
      }
    })
  );
});
