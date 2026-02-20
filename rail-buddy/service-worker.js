/**
 * RailBuddy Service Worker
 * Scope: /rail-buddy/
 * Handles caching and offline functionality for RailBuddy app
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `rail-buddy-cache-${CACHE_VERSION}`;

// RailBuddy-specific assets to cache
const STATIC_ASSETS = [
  // RailBuddy entry
  '/rail-buddy/',
  '/rail-buddy/index.html',
  '/rail-buddy/manifest.json',
  
  // RailBuddy styles
  '/rail-buddy/css/style-tdt.css',
  
  // RailBuddy scripts
  '/rail-buddy/js/tsa.js',
  '/rail-buddy/js/menu.js',
  '/rail-buddy/js/settings.js',
  '/rail-buddy/js/delays-bar-chart.js',
  '/rail-buddy/js/ft-lt.js',
  '/rail-buddy/js/hist.js',
  '/rail-buddy/js/lrt-mkbf-line-chart.js',
  '/rail-buddy/js/mob-navtabs.js',
  '/rail-buddy/js/mrt-mkbf-line-chart.js',
  '/rail-buddy/js/scrape-sbs-transit.js',
  '/rail-buddy/js/scrape-smrt.js',
  '/rail-buddy/js/sysMap.js',
  
  // RailBuddy assets
  '/rail-buddy/assets/',
  '/rail-buddy/networks/',
  
  // RailBuddy JSON data
  '/rail-buddy/json/',
  
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
  '/rail-buddy/assets/icon-192.png',
  '/rail-buddy/assets/icon-512.png'
];

// Install: cache RailBuddy assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('[RailBuddy SW] Some assets could not be cached:', err);
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
          .filter(name => name.startsWith('rail-buddy-cache-') && name !== CACHE_NAME)
          .map(cacheName => {
            console.log('[RailBuddy SW] Deleting old cache:', cacheName);
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
  
  // Only handle GET requests within RailBuddy scope
  if (request.method !== 'GET' || !url.pathname.startsWith('/rail-buddy/')) {
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
  
  console.log('[RailBuddy SW] Message received:', event.data.type);
  
  switch (event.data.type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
    
    case 'CLEAR_CACHE':
      caches.delete(CACHE_NAME).then(() => {
        console.log('[RailBuddy SW] Cache cleared');
      });
      break;
    
    default:
      console.log('[RailBuddy SW] Unknown message type:', event.data.type);
  }
});
