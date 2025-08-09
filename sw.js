const CACHE_NAME = "scoreup-v1";
const urlsToCache = [
  "/ScoreUp/",
  "/ScoreUp/index.html",
  "/ScoreUp/js.js",
  "/ScoreUp/manifest.json",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
  // agrega aquí tus íconos si los tienes
  "/ScoreUp/icon-192.png",
  "/ScoreUp/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});