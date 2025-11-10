const cacheName = 'gamex-cache-v3';
const assets = [
  './',
  './index.html',
  './offline.html',
  './style.css',
  './panier.js',
  './particles.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Installer et mettre en cache
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(assets))
  );
  self.skipWaiting();
});

// Activer et nettoyer les anciens caches
self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== cacheName) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Stale-While-Revalidate + page offline
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.open(cacheName).then(cache => {
      return cache.match(evt.request).then(cachedResponse => {
        const fetchPromise = fetch(evt.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(evt.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // Si hors-ligne et pas en cache, retourne offline.html
          return cache.match('./offline.html');
        });
        
        return cachedResponse || fetchPromise;
      });
    })
  );
});