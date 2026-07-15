const CACHE_NAME = 'fitness-v1';
const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'manifest.json',
  'css/styles.css',
  'js/main.js',
  'js/storage.js',
  'js/charts.js',
  'js/adaptive.js',
  'js/library.js',
  'js/ai-hook.js',
  'js/screens/today.js',
  'js/screens/history.js',
  'js/screens/plan.js',
  'data/exercises.json',
  'icons/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch((err) => {
      console.error('Cache install failed:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        return caches.match('index.html');
      });
    })
  );
});
