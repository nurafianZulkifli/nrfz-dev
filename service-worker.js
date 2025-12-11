const CACHE_NAME = "buszy-cache-v1";
const urlsToCache = [
  "/nrfz-dev/buszy.html",
  "/nrfz-dev/css/style.css",
  "/nrfz-dev/css/style-breakpoints.css",
  "/nrfz-dev/css/dark-mode.css",
  "/nrfz-dev/js/navtabs.js",
  "/nrfz-dev/buszy/buszy.js",
  "/nrfz-dev/img/core-img/favicon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});