const CACHE_VERSION = 'v3';
const CACHE_NAME = `nrfz-cache-${CACHE_VERSION}`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/index.html',
  '/buszy.html',
  '/rail-buddy.html',
  '/css/style.css',
  '/css/style-breakpoints.css',
  '/css/dark-mode.css',
  '/css/bootstrap.min.css',
  '/css/carousel.css',
  '/css/glightbox.min.css',
  '/css/magnific-popup.css',
  '/css/owl.carousel.min.css',
  '/css/swiper-bundle.min.css',
  '/css/animate.css',
  '/js/utils.js',
  '/js/navtabs.js',
  '/js/jquery.min.js',
  '/js/bootstrap.min.js',
  '/manifest.json'
];

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('[Service Worker] Some assets failed to cache:', err);
        // Continue even if some assets fail to cache
      });
    }).then(() => {
      self.skipWaiting();
    })
  );
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
    })
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Network first, fallback to cache for API calls
  if (url.pathname.includes('/api/') || url.pathname.includes('.json')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const cache = caches.open(CACHE_NAME);
            cache.then(c => c.put(request, response.clone()));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then(cached => cached || createOfflineResponse());
        })
    );
    return;
  }

  // Cache first, fallback to network for static assets
  event.respondWith(
    caches.match(request)
      .then(cached => {
        if (cached) {
          return cached;
        }
        return fetch(request).then(response => {
          if (response.ok && (request.method === 'GET')) {
            const cache = caches.open(CACHE_NAME);
            cache.then(c => c.put(request, response.clone()));
          }
          return response;
        });
      })
      .catch(() => createOfflineResponse())
  );
});

function createOfflineResponse() {
  return new Response(
    '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your network connection.</p></body></html>',
    {
      headers: { 'Content-Type': 'text/html' },
      status: 503,
      statusText: 'Service Unavailable'
    }
  );
}

// Handle messages from the client (main application)
self.addEventListener('message', event => {
  if (!event.data) return;

  console.log('[Service Worker] Message received:', event.data.type);

  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'KEEP_ALIVE':
      // Keep-alive ping from client, respond to keep connection warm
      console.log('[Service Worker] Keep-alive ping received');
      event.ports[0].postMessage({ received: true });
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(
        caches.delete(CACHE_NAME).then(() => {
          event.ports[0].postMessage({ success: true });
        })
      );
      break;

    default:
      console.log('[Service Worker] Unknown message type:', event.data.type);
  }
});