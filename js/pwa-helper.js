/**
 * PWA Install Helper
 * Handles service worker registration and PWA installation prompts
 * Include this script in your PWA HTML files
 */

class PWAHelper {
  constructor() {
    this.installPromptEvent = null;
    this.isInstalled = false;
    this.init();
  }

  init() {
    // Check if app is already installed
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('APP: Running as standalone PWA');
    }

    // Register service worker
    this.registerServiceWorker();

    // Setup install prompt handling
    this.setupInstallPrompt();

    // Setup periodic background sync (optional)
    this.setupBackgroundSync();
  }

  /**
   * Register the service worker
   */
  registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('PWA: Service Workers not supported');
      return;
    }

    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.log('PWA: Service Worker registered successfully', registration);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60000); // Every 60 seconds

        // Listen for service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('PWA: New service worker activated');
              this.notifyUpdateAvailable();
            }
          });
        });
      })
      .catch(error => {
        console.error('PWA: Service Worker registration failed:', error);
      });

    // Handle service worker messages
    navigator.serviceWorker.addEventListener('message', event => {
      console.log('PWA: Message from service worker:', event.data);
    });
  }

  /**
   * Setup install prompt handling (before install prompt is shown)
   */
  setupInstallPrompt() {
    // The 'beforeinstallprompt' event fires if:
    // 1. The app is not already installed
    // 2. The manifest is valid
    // 3. The app meets PWA criteria
    window.addEventListener('beforeinstallprompt', event => {
      console.log('PWA: beforeinstallprompt event fired');
      
      // Prevent the mini-infobar from appearing
      event.preventDefault();
      
      // Store the event for later use
      this.installPromptEvent = event;
      
      // Show install prompt UI
      this.showInstallPrompt();
    });

    // Handle app installation
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.isInstalled = true;
      this.hideInstallPrompt();
    });

    // Handle installation failure
    window.addEventListener('onbeforeinstallprompterror', () => {
      console.error('PWA: Installation prompt error');
    });
  }

  /**
   * Show install prompt to user
   */
  showInstallPrompt() {
    // Create or update install banner if it doesn't exist
    let banner = document.getElementById('pwa-install-banner');
    
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'pwa-install-banner';
      banner.innerHTML = `
        <style>
          #pwa-install-banner {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 320px;
            animation: slideUp 0.3s ease-out;
          }

          @keyframes slideUp {
            from {
              transform: translateY(100px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          #pwa-install-banner h3 {
            margin: 0 0 8px 0;
            font-size: 16px;
            font-weight: 600;
          }

          #pwa-install-banner p {
            margin: 0 0 12px 0;
            font-size: 14px;
            opacity: 0.95;
          }

          #pwa-install-banner .button-group {
            display: flex;
            gap: 8px;
          }

          #pwa-install-banner button {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 4px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background 0.2s;
          }

          #pwa-install-banner .install-btn {
            background: white;
            color: #007bff;
          }

          #pwa-install-banner .install-btn:hover {
            background: #f0f0f0;
          }

          #pwa-install-banner .cancel-btn {
            background: rgba(255, 255, 255, 0.2);
            color: white;
          }

          #pwa-install-banner .cancel-btn:hover {
            background: rgba(255, 255, 255, 0.3);
          }

          @media (max-width: 480px) {
            #pwa-install-banner {
              bottom: 10px;
              right: 10px;
              left: 10px;
              max-width: none;
            }
          }
        </style>
        <h3>Install App</h3>
        <p>Add this app to your home screen for quick access</p>
        <div class="button-group">
          <button class="install-btn" id="pwa-install-btn">Install</button>
          <button class="cancel-btn" id="pwa-cancel-btn">Not Now</button>
        </div>
      `;
      
      document.body.appendChild(banner);
      
      // Event listeners
      document.getElementById('pwa-install-btn').addEventListener('click', () => {
        this.promptInstall();
      });
      
      document.getElementById('pwa-cancel-btn').addEventListener('click', () => {
        this.hideInstallPrompt();
        // Don't show again for this session
        sessionStorage.setItem('pwa-install-dismissed', 'true');
      });
    } else {
      banner.style.display = 'block';
    }
  }

  /**
   * Hide install prompt
   */
  hideInstallPrompt() {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) {
      banner.style.display = 'none';
    }
  }

  /**
   * Trigger the browser install prompt
   */
  async promptInstall() {
    if (!this.installPromptEvent) {
      console.warn('PWA: Install prompt not available');
      return false;
    }

    try {
      this.installPromptEvent.prompt();
      const { outcome } = await this.installPromptEvent.userChoice;
      
      if (outcome === 'accepted') {
        console.log('PWA: User accepted installation');
      } else {
        console.log('PWA: User dismissed installation');
      }
      
      this.installPromptEvent = null;
      return outcome === 'accepted';
    } catch (error) {
      console.error('PWA: Error triggering install prompt:', error);
      return false;
    }
  }

  /**
   * Notify user of available update
   */
  notifyUpdateAvailable() {
    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 320px;
      animation: slideDown 0.3s ease-out;
    `;
    
    message.innerHTML = `
      <strong>Update Available</strong>
      <p style="margin: 8px 0 0 0; font-size: 14px;">A new version is available. Refresh to update.</p>
      <style>
        @keyframes slideDown {
          from {
            transform: translateY(-100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      </style>
    `;
    
    document.body.appendChild(message);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      message.remove();
    }, 10000);
  }

  /**
   * Setup periodic background sync (requires Background Sync API support)
   */
  setupBackgroundSync() {
    if (!('sync' in ServiceWorkerRegistration.prototype)) {
      console.warn('PWA: Background Sync API not supported');
      return;
    }

    navigator.serviceWorker.ready.then(registration => {
      // Example: Sync data periodically
      registration.sync.register('periodic-sync').catch(error => {
        console.warn('PWA: Background sync registration failed:', error);
      });
    });
  }

  /**
   * Send message to service worker
   */
  sendMessage(type, data = {}) {
    if (!navigator.serviceWorker.controller) {
      console.warn('PWA: No active service worker');
      return Promise.reject(new Error('No active service worker'));
    }

    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      
      channel.port1.onmessage = (event) => {
        if (event.data.error) {
          reject(new Error(event.data.error));
        } else {
          resolve(event.data);
        }
      };

      navigator.serviceWorker.controller.postMessage(
        { type, ...data },
        [channel.port2]
      );
    });
  }

  /**
   * Clear all caches
   */
  async clearCache() {
    try {
      await this.sendMessage('CLEAR_CACHE');
      console.log('PWA: Cache cleared');
      return true;
    } catch (error) {
      console.error('PWA: Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Get app status
   */
  getStatus() {
    return {
      isInstalled: this.isInstalled,
      isOnline: navigator.onLine,
      serviceWorkerActive: !!navigator.serviceWorker.controller,
      timestamp: new Date().toISOString()
    };
  }
}

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.pwaHelper) {
      window.pwaHelper = new PWAHelper();
    }
  });
} else {
  if (!window.pwaHelper) {
    window.pwaHelper = new PWAHelper();
  }
}

// Export for manual use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWAHelper;
}
