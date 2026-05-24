const CACHE_NAME = 'sajilo-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/sajilo_icon.jpg',
  '/manifest.json'
];

// Install stage: open cache and store core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate stage: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch stage: network first with cache fallback for regular files, network only for APIs
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Do not intercept or cache /api/* lines (must go to server always)
  if (url.pathname.startsWith('/api/') || url.pathname === '/health') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // If index page fails and we are offline, return cash root index
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          return Promise.reject('offline');
        });
      })
  );
});
