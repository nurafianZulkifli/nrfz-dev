/**
 * Buszy Service Worker
 * Scope: /buszy/
 * Handles caching and offline functionality for Buszy app
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `buszy-cache-${CACHE_VERSION}`;

// Buszy-specific assets to cache
const STATIC_ASSETS = [
  // Buszy entry
  '/buszy/',
  '/buszy/index.html',
  '/buszy/manifest.json',
  
  // Buszy styles
  '/buszy/css/style-buszy.css',
  
  // Buszy scripts
  '/buszy/js/buszy-main.js',
  '/buszy/js/menu.js',
  '/buszy/js/settings.js',
  '/buszy/js/abs.js',
  '/buszy/js/ann.js',
  '/buszy/js/art.js',
  '/buszy/js/fl-bus.js',
  '/buszy/js/mob-navtabs.js',
  '/buszy/js/nbs.js',
  '/buszy/js/pinned.js',
  '/buszy/js/scrape-bus-timings.js',
  '/buszy/js/tsa.js',
  
  // Buszy assets
  '/buszy/assets/',
  
  // Shared utilities
  '/shared/js/utils.js',
  '/shared/js/pwa-helper.js',
  
  // Shared CSS
  '/shared/css/style.css',
  '/shared/css/dark-mode.css',
  '/shared/css/style-breakpoints.css',
  '/shared/css/bootstrap.min.css',
  '/shared/css/animate.css',
  '/shared/css/carousel.css',
  '/shared/css/swiper-bundle.min.css',
  
  // Shared JS libraries
  '/shared/js/bootstrap.min.js',
  '/shared/js/jquery.min.js',
  '/shared/js/popper.min.js',
  
  // Icons
  '/shared/img/core-img/favicon.png',
  '/buszy/assets/icon-192.png',
  '/buszy/assets/icon-512.png'
];

// Install: cache Buszy assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[Buszy SW] Some assets could not be cached:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('buszy-cache-') && name !== CACHE_NAME)
          .map(cacheName => {
            console.log('[Buszy SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch: serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle GET requests within Buszy scope
  if (request.method !== 'GET' || !url.pathname.startsWith('/buszy/')) {
    return;
  }
  
  // Cache first strategy
  event.respondWith(
    caches.match(request).then(response => {
      if (response) {
        return response;
      }
      
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        // Cache successful responses
        if (shouldCache(request.url)) {
          const respCopy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, respCopy);
          });
        }
        
        return response;
      }).catch(() => {
        // Offline fallback
        return new Response('Offline - content not available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
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

// Message handler
self.addEventListener('message', event => {
  if (!event.data) return;
  
  console.log('[Buszy SW] Message received:', event.data.type);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME).then(() => {
        console.log('[Buszy SW] Cache cleared');
      });
      break;
    
    default:
      console.log('[Buszy SW] Unknown message type:', event.data.type);
  }
});
