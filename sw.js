const CACHE_NAME = "scoreup-v2";
const urlsToCache = [
  "/ScoreUp/",
  "/ScoreUp/index.html",
  "/ScoreUp/js.js",
  "/ScoreUp/manifest.json",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  "/ScoreUp/icon-192.png",
  "/ScoreUp/icon-512.png"
];

// Instalar y cachear
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activar y limpiar cachés viejas
self.addEventListener("activate", event => {
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

// Interceptar requests
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Devuelve de cache si existe
      if (response) return response;

      // Si no está en cache, intenta pedirlo a la red
      return fetch(event.request).catch(() => {
        // Si falla la red y es el index, devuelve el index cacheado
        if (event.request.mode === "navigate") {
          return caches.match("/ScoreUp/index.html");
        }
      });
    })
  );
});
