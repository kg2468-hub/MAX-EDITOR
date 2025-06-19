// sw.js
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("max-editor-cache").then((cache) =>
      cache.addAll([
        "/",                   // Página principal
        "/index.html",
        "/style.css",
        "/script.js",
        "/manifest.json",
        "/B16F9EF0-7FBF-4459-AD61-8762E97BD37A.png",
        "/B16F9EF0-7FBF-4459-AD61-8762E97BD37A.png"
      ])
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
