const CACHE_NAME = 'max-editor-cache-v2'; // ← Altere o nome do cache a cada nova versão
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
  './icone.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting(); // ⚠️ Faz o novo SW assumir imediatamente
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  // ⚠️ Remove caches antigos
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }))
    )
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});