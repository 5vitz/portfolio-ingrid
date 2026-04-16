self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  // Basic fetch handler
  e.respondWith(fetch(e.request));
});
