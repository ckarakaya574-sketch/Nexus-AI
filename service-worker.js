const CACHE_NAME = 'nexus-ai-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Not: Gerçek uygulama ikonlarınızı oluşturduktan sonra 
  // aşağıdaki satırların yorumunu kaldırıp dosyaları önbelleğe ekleyin.
  // '/icon-192x192.png',
  // '/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Önbellekte varsa, önbellekten döndür
        if (response) {
          return response;
        }

        // Önbellekte yoksa, ağdan getir
        return fetch(event.request);
      }
    )
  );
});

// Eski önbellekleri temizle
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
