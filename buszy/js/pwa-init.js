/**
 * Buszy PWA Initialization
 * Configures and initializes PWA functionality for the Buszy app
 */

window.addEventListener('load', () => {
  // Initialize PWA Helper for Buszy
  window.buszyPWA = new PWAHelper({
    appName: 'Buszy',
    swPath: '/buszy/service-worker.js',
    scope: '/buszy/',
    cacheName: 'buszy-cache-v1',
    showInstallBanner: true,
    onInstalled: () => {
      console.log('Buszy app installed successfully');
      // Optional: Track installation event
      if (window.gtag) {
        window.gtag('event', 'app_install', {
          app_name: 'Buszy'
        });
      }
    }
  });

  console.log('[Buszy] PWA initialized');
  console.log('[Buszy] Status:', window.buszyPWA.getStatus());
});

// Expose PWA helper to window for debugging/manual use
window.getBuszyPWAStatus = () => {
  return window.buszyPWA ? window.buszyPWA.getStatus() : null;
};

window.clearBuszyCache = () => {
  return window.buszyPWA ? window.buszyPWA.clearCache() : Promise.reject('PWA not initialized');
};
