const CACHE_NAME = "xiao-lai-vs-ke-cache-v2";

const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./app.js",
  "./service-worker.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./1724774632_39142-removebg-preview.png",
  "./ADEY0941-removebg-preview.png",
  "./phpxNc89t-removebg-preview.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
