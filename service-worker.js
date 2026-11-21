const CACHE_NAME = "phoenix-calculator-v216";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./style.css?v=216",
  "./phoenix-recipes.js",
  "./phoenix-recipes.js?v=216",
  "./phoenix-quads-data.js",
  "./phoenix-quads-data.js?v=216",
  "./phoenix-quads-renderer.js",
  "./phoenix-quads-renderer.js?v=216",
  "./phoenix-preview.js",
  "./phoenix-preview.js?v=216",
  "./app.js",
  "./app.js?v=216",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./favicon-32.png",
  "./favicon-16.png"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
