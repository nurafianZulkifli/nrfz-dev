/**
 * Root service worker for the Works by NRFZ app.
 * Child apps use their own scoped workers under /buszy/ and /rail-buddy/.
 */
const CACHE_NAME = 'main-cache-v1';
const BASE_PATH = new URL('./', self.registration.scope).pathname;
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/style.css',
  './css/pwa-styles.css',
  './css/style-mobNav.css',
  './css/style-breakpoints.css',
  './css/dark-mode.css',
  './js/pwa-config.js',
  './js/pwa-helper.js',
  './js/pwa-init-main.js',
  './img/core-img/favicon.png',
  './img/core-img/icon-192.png',
  './img/core-img/icon-512.png'
].map(path => new URL(path, self.registration.scope).pathname);

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('main-cache-') && name !== CACHE_NAME)
          .map(name => {
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

self.skipWaiting();

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (!requestUrl.pathname.startsWith(BASE_PATH)) return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).then(response => {
        if (response.ok && response.type === 'basic') {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseCopy));
        }
        return response;
      });
    })
  );
});