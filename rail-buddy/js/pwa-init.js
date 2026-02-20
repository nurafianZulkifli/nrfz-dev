/**
 * RailBuddy PWA Initialization
 * Configures and initializes PWA functionality for the RailBuddy app
 */

window.addEventListener('load', () => {
  // Initialize PWA Helper for RailBuddy
  window.railbuddyPWA = new PWAHelper({
    appName: 'RailBuddy',
    swPath: '/rail-buddy/service-worker.js',
    scope: '/rail-buddy/',
    cacheName: 'rail-buddy-cache-v1',
    showInstallBanner: true,
    onInstalled: () => {
      console.log('RailBuddy app installed successfully');
      // Optional: Track installation event
      if (window.gtag) {
        window.gtag('event', 'app_install', {
          app_name: 'RailBuddy'
        });
      }
    }
  });

  console.log('[RailBuddy] PWA initialized');
  console.log('[RailBuddy] Status:', window.railbuddyPWA.getStatus());
});

// Expose PWA helper to window for debugging/manual use
window.getRailBuddyPWAStatus = () => {
  return window.railbuddyPWA ? window.railbuddyPWA.getStatus() : null;
};

window.clearRailBuddyCache = () => {
  return window.railbuddyPWA ? window.railbuddyPWA.clearCache() : Promise.reject('PWA not initialized');
};
