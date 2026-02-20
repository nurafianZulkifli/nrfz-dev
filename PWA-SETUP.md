# Progressive Web Apps (PWA) Setup

Your **Buszy** and **RailBuddy** applications are now configured as Progressive Web Apps (PWAs), allowing users to install them as native applications on their devices.

## What is a PWA?

A Progressive Web App is a web application that:
- ✅ Works offline or with poor connectivity
- ✅ Can be installed on any device (phone, tablet, desktop)
- ✅ Provides app-like experience with standalone window
- ✅ Has fast load times with service worker caching
- ✅ Receives updates automatically

## Installation Instructions

### On Mobile (Android/Chrome, iOS/Safari)

#### Android & Chrome:
1. Open the app in Chrome browser: `https://yourdomain.com/buszy.html` or `https://yourdomain.com/rail-buddy.html`
2. Look for the **"Install"** banner at the bottom right of the screen
3. Tap **"Install"** to add the app to your home screen
4. Alternatively, tap the **menu (⋮)** → **"Install app"**

#### iPhone & Safari:
1. Open the app in Safari browser
2. Tap the **Share** icon at the bottom
3. Select **"Add to Home Screen"**
4. Tap **"Add"** to confirm

### On Desktop

#### Chrome/Edge/Brave:
1. Open the app in your browser
2. Click the **install icon** in the address bar (looks like an arrow pointing down to a square)
3. Click **"Install"** in the dialog

#### Other Browsers:
- Click the **menu (⋮)** → **"Install app"** or similar option

## Files & Configuration

### Manifest Files
- **`buszy/manifest.json`** - Buszy PWA configuration
- **`rail-buddy/manifest.json`** - RailBuddy PWA configuration

Each manifest includes:
- App name and description
- App icons (192x192 and 512x512)
- App shortcuts
- Theme colors
- Display modes

### Service Worker
- **`service-worker.js`** - Handles offline functionality and asset caching
  - Caches static assets on installation
  - Serves cached content when offline
  - Supports cache-first strategy for better performance
  - Handles background sync messages

### PWA Helper
- **`js/pwa-helper.js`** - PWA installation and management utilities
  - Service worker registration
  - Install prompt handling and UI
  - Update notifications
  - App status checking
  - Cache management

## Features Enabled

### 🔄 Service Worker Caching
- Static assets (CSS, JS, images) are cached on first load
- App works offline with cached content
- Automatic updates when new versions are available

### 📲 Installation Prompt
- Smart installation banner appears on eligible devices
- Users can dismiss the prompt
- Automatic detection of already-installed apps

### 📝 App Metadata
- Custom app icons
- App name and description visible on home screen
- Theme colors customized for brand identity

### 🔌 Offline Mode
- Core functionality works without internet connection
- Graceful fallback for unavailable content
- Users are informed when offline

### ⚡ Performance
- Faster load times with service worker caching
- Reduced bandwidth usage
- Instant launches for installed apps

## API Reference (PWA Helper)

The PWA Helper is automatically initialized as `window.pwaHelper`. Use these methods:

```javascript
// Get app installation status
const status = pwaHelper.getStatus();
// Returns: { isInstalled, isOnline, serviceWorkerActive, timestamp }

// Clear all cached data
await pwaHelper.clearCache();

// Send message to service worker
await pwaHelper.sendMessage('message-type', { data: 'value' });

// Show manual install prompt
await pwaHelper.promptInstall();
```

## Troubleshooting

### App Won't Install
- Ensure you're using HTTPS (PWAs require secure context)
- Check browser compatibility (Chrome, Edge, Firefox, Safari all supported)
- Verify manifest files are valid JSON with no syntax errors
- Mobile browsers may require app to meet PWA criteria (icons, manifest, service worker)

### Service Worker Not Registered
- Open browser DevTools (F12)
- Go to Application → Service Workers
- Check for error messages
- Ensure `service-worker.js` is in the root directory

### Cache Not Working
- Check Network tab in DevTools while offline
- Service workers require HTTPS in production
- Clear site data and reload if cache is corrupted

### Icons Not Showing
- Verify image files exist at specified paths
- Use minimum size of 192x192 PNG
- Check file permissions and paths in manifest.json

## PWA Checklist

Your PWAs meet these requirements:

- [x] HTTPS enabled (production)
- [x] Service worker configured
- [x] Manifest file with metadata
- [x] App icon (192x192 and 512x512)
- [x] Responsive design
- [x] Full-screen capable
- [x] App name and description
- [x] Themed colors
- [x] Offline fallback

## Browser Support

| Browser | Android | iOS | Desktop |
|---------|---------|-----|---------|
| Chrome/Chromium | ✅ Full | ⚠️ Limited | ✅ Full |
| Firefox | ✅ Full | ❌ No | ✅ Full |
| Safari | ✅ Partial | ✅ Full | ✅ Partial |
| Edge | ✅ Full | ✅ Full | ✅ Full |

## Next Steps

### To Improve PWA Experience:

1. **Add Splash Screen Images**
   - Add larger icon sizes (384x384, 1024x1024) to manifest
   - Create custom splash screens

2. **Implement Push Notifications**
   - Setup notification API
   - Add notification permissions request
   - Send updates via Web Push

3. **Add App Shortcuts**
   - Already configured in manifest
   - Add more quick-access shortcuts as needed

4. **Background Sync**
   - Currently supported in service worker
   - Implement periodic data sync

5. **Enable Share Target**
   - Already configured in manifest
   - Implement form handling for shared content

## Resources

- [MDN PWA Documentation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Google PWA Checklist](https://web.dev/pwa-checklist/)
- [Web.dev PWA Learning](https://web.dev/progressive-web-apps/)
- [MDN Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Created**: February 2026  
**Buszy App**: Transit bus timings and alerts  
**RailBuddy App**: Train status and schedules
