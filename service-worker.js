const CACHE_VERSION = 'v1';
const CACHE_NAME = `nrfz-cache-${CACHE_VERSION}`;

// Assets to cache on installation
const STATIC_ASSETS = [
  // Root files
  '/',
  '/index.html',
  '/buszy.html',
  '/rail-buddy.html',
  '/manifest.json',
  
  // CSS files
  '/css/style.css',
  '/css/bootstrap.min.css',
  '/css/dark-mode.css',
  '/css/style-breakpoints.css',
  '/css/animate.css',
  '/css/carousel.css',
  '/css/swiper-bundle.min.css',
  
  // Core JS files
  '/js/utils.js',
  '/js/bootstrap.min.js',
  '/js/jquery.min.js',
  '/js/popper.min.js',
  
  // Images
  '/img/core-img/favicon.png',
  '/img/core-img/icon-192.png',
  '/img/core-img/icon-512.png',
  '/img/core-img/logo.png',
  
  // Buszy assets
  '/buszy/manifest.json',
  '/buszy/css/style-buszy.css',
  '/buszy/js/buszy-main.js',
  '/buszy/js/menu.js',
  
  // Rail-buddy assets
  '/rail-buddy/manifest.json',
  '/rail-buddy/css/style-tdt.css',
  '/rail-buddy/js/tsa.js'
];

// Install event - cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[Service Worker] Some assets could not be cached:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache first, then network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests and external requests
  if (request.method !== 'GET' || !url.origin.includes(location.origin)) {
    return;
  }
  
  // Strategy: Cache first, fallback to network
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(request).then(response => {
        // Don't cache if not successful
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        // Cache successful responses for HTML, CSS, JS, and images
        if (shouldCache(request.url)) {
          const respCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, respCopy);
          });
        }
        
        return response;
      }).catch(() => {
        // Return offline page or cached response if available
        return caches.match(request).then(cached => {
          return cached || new Response('Offline - content not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      });
    })
  );
});

// Determine if URL should be cached
function shouldCache(url) {
  const cacheableExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.json'];
  return cacheableExtensions.some(ext => url.endsWith(ext)) || url.endsWith('/');
}

// Handle messages from the client
self.addEventListener('message', event => {
  if (!event.data) return;
  
  console.log('[Service Worker] Message received:', event.data.type);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'KEEP_ALIVE':
      console.log('[Service Worker] Keep-alive ping received');
      if (event.ports[0]) {
        event.ports[0].postMessage({ received: true });
      }
      break;
    
    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME).then(() => {
        console.log('[Service Worker] Cache cleared');
      });
      break;
    
    default:
      console.log('[Service Worker] Unknown message type:', event.data.type);
  }
});