const CACHE_NAME = 'activity-tracker-v1';
const ASSETS = [
  '/ActivityTracker.html',
  '/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('/ActivityTracker.html')))
  );
});

// Push Notifications for alarms
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'Activity Reminder', body: 'Time for your activity!' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'activity-reminder',
      renotify: true,
      actions: [
        { action: 'done', title: '✅ Mark Done' },
        { action: 'snooze', title: '⏰ Snooze 10m' }
      ]
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'done') {
    self.clients.openWindow('/ActivityTracker.html#mark-done');
  } else {
    self.clients.openWindow('/ActivityTracker.html');
  }
});
