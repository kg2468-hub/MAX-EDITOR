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
        "/icone192.png",
        "/icone512.png"
      ])
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
