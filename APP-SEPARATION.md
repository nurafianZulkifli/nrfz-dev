# Separating Buszy and RailBuddy as Standalone PWAs

## Overview
Your Buszy and RailBuddy apps are now fully separated as standalone Progressive Web Apps, each with their own service workers, manifests, and caching strategies. They can be installed independently on user devices.

## Current Setup

### App Entry Points
- **Buszy**: `domain.com/buszy/` (formerly `domain.com/buszy.html`)
- **RailBuddy**: `domain.com/rail-buddy/` (formerly `domain.com/rail-buddy.html`)

### File Structure
```
nrfz-dev/
├── buszy/
│   ├── index.html                 ← Entry point (replaces buszy.html)
│   ├── service-worker.js          ← Buszy-scoped service worker
│   ├── manifest.json              ← Buszy manifest
│   ├── css/
│   ├── js/
│   ├── assets/                    ← Buszy icons & images
│   └── ...other app files
│
├── rail-buddy/
│   ├── index.html                 ← Entry point (replaces rail-buddy.html)
│   ├── service-worker.js          ← RailBuddy-scoped service worker
│   ├── manifest.json              ← RailBuddy manifest
│   ├── css/
│   ├── js/
│   ├── assets/                    ← RailBuddy icons & images
│   └── ...other app files
│
├── buszy.html                     ← LEGACY (can redirect or delete)
├── rail-buddy.html                ← LEGACY (can redirect or delete)
├── service-worker.js              ← LEGACY (can delete)
├── manifest.json                  ← LEGACY (main site manifest)
│
└── css/ & js/                     ← Shared resources
    └── (used by both apps)
```

## How to Access the Apps

### Installation Methods

#### Web Access:
```
Buszy:      https://domain.com/buszy/
RailBuddy:  https://domain.com/rail-buddy/
```

#### App Installation (Users):
1. Open in browser: `https://domain.com/buszy/` or `https://domain.com/rail-buddy/`
2. Look for **"Install"** prompt
3. Add to home screen
4. App installs independently
5. Each app can be uninstalled separately

## Service Worker Isolation

Each app has a **scoped service worker**:

```javascript
// Buszy Service Worker
// Scope: /buszy/
// Caches only Buszy-specific assets
// Isolated cache: 'buszy-cache-v1'

// RailBuddy Service Worker
// Scope: /rail-buddy/
// Caches only RailBuddy-specific assets
// Isolated cache: 'rail-buddy-cache-v1'
```

### Benefits of Scoped Service Workers:
- ✅ Independent caching per app
- ✅ Updates to one app don't affect the other
- ✅ Users can update Buszy without updating RailBuddy
- ✅ Each app can have different cache strategies
- ✅ No cache conflicts or interference
- ✅ Offline functionality independent per app

## Configuration

### Server-Side Setup (Express.js example)

```javascript
// server.js
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from project root
app.use(express.static(path.join(__dirname)));

// Buszy app routes
app.get('/buszy/', (req, res) => {
  res.sendFile(path.join(__dirname, 'buszy/index.html'));
});

// RailBuddy app routes
app.get('/rail-buddy/', (req, res) => {
  res.sendFile(path.join(__dirname, 'rail-buddy/index.html'));
});

// Service workers (with proper MIME type)
app.get('/buszy/service-worker.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'buszy/service-worker.js'));
});

app.get('/rail-buddy/service-worker.js', (req, res) => {
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'rail-buddy/service-worker.js'));
});

// Legacy redirects (optional)
app.get('/buszy.html', (req, res) => {
  res.redirect(301, '/buszy/');
});

app.get('/rail-buddy.html', (req, res) => {
  res.redirect(301, '/rail-buddy/');
});

// Main site
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name domain.com;
    root /var/www/nrfz-dev;

    # Buszy app
    location /buszy/ {
        try_files $uri /buszy/index.html;
    }

    # Buszy service worker
    location /buszy/service-worker.js {
        types { application/javascript js; }
        add_header Service-Worker-Allowed "/buszy/";
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # RailBuddy app
    location /rail-buddy/ {
        try_files $uri /rail-buddy/index.html;
    }

    # RailBuddy service worker
    location /rail-buddy/service-worker.js {
        types { application/javascript js; }
        add_header Service-Worker-Allowed "/rail-buddy/";
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Service worker MIME type
    types {
        application/javascript js;
    }

    # Shared static files
    location ~* \.(css|js|png|jpg|gif|svg)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## Migration Steps

### If You Have the Apps Installed:

**On Mobile (Android/Chrome):**
1. Go to Settings → Apps → Find **"Buszy"** or **"RailBuddy"**
2. Uninstall  
3. Visit `https://domain.com/buszy/` or `https://domain.com/rail-buddy/`
4. Install as new app

**On iOS:**
1. Remove app from home screen
2. Visit `https://domain.com/buszy/` or `https://domain.com/rail-buddy/` in Safari
3. Share → Add to Home Screen

### For Development:

Clear service worker cache:
```javascript
// In browser console
caches.delete('buszy-cache-v1');
caches.delete('rail-buddy-cache-v1');

// Or use the PWA helper
pwaHelper.clearCache();
```

Unregister service workers:
```javascript
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});
```

## Features per App

### Buszy (/buszy/)
- Independent cache: `buszy-cache-v1`
- Service worker scope: `/buszy/`
- Manifest: `/buszy/manifest.json`
- Entry point: `/buszy/index.html`
- Offline functionality: Cached bus timings data

### RailBuddy (/rail-buddy/)
- Independent cache: `rail-buddy-cache-v1`
- Service worker scope: `/rail-buddy/`
- Manifest: `/rail-buddy/manifest.json`
- Entry point: `/rail-buddy/index.html`
- Offline functionality: Cached train delays data

## Updating Apps

### To Update Buszy:
1. Modify files in `/buszy/` folder
2. Update `/buszy/service-worker.js` versions if needed
3. Deploy changes
4. Service worker automatically detects updates
5. Users prompted to refresh or auto-updated on next visit

### To Update RailBuddy:
1. Modify files in `/rail-buddy/` folder
2. Update `/rail-buddy/service-worker.js` versions if needed
3. Deploy changes
4. Service worker automatically detects updates
5. Users prompted to refresh or auto-updated on next visit

## Verifying Separation

### Check Service Workers:
```javascript
// In browser console:

// Register Buszy SW
navigator.serviceWorker.register('/buszy/service-worker.js')
  .then(reg => console.log('Buszy SW scope:', reg.scope));

// Register RailBuddy SW
navigator.serviceWorker.register('/rail-buddy/service-worker.js')
  .then(reg => console.log('RailBuddy SW scope:', reg.scope));

// View all service workers
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => console.log(reg.scope));
});
```

### Check Caches:
```javascript
// View all cache names
caches.keys().then(names => console.log(names));

// Output should show:
// ['buszy-cache-v1', 'rail-buddy-cache-v1', ...]
```

### Check Manifests:
- Buszy manifest: `/buszy/manifest.json`
- RailBuddy manifest: `/rail-buddy/manifest.json`
- Each has independent scopes and icons

## Troubleshooting

### Apps Interfering with Each Other
**Solution**: Clear old root-level service worker
```bash
rm service-worker.js                    # Delete old shared SW
rm manifest.json                        # Delete old shared manifest
```

### Service Worker Not Registering
```javascript
// Check for errors
navigator.serviceWorker.getRegistrations().then(regs => {
  if (regs.length === 0) console.log('No SWs registered');
});

// Check specific errors
navigator.serviceWorker.register('/buszy/service-worker.js')
  .catch(error => console.error('Registration failed:', error));
```

### Cache Not Clearing Between Updates
```javascript
// Force clear and update
caches.delete('buszy-cache-v1').then(() => {
  location.reload();
});
```

### Icons Not Showing
Verify paths in each manifest:
- `/buszy/manifest.json` → references `/buszy/assets/icon-*.png`
- `/rail-buddy/manifest.json` → references `/rail-buddy/assets/icon-*.png`

## Next Steps

1. **Test locally**: Run `node server.js` and visit `http://localhost:3000/buszy/` and `http://localhost:3000/rail-buddy/`

2. **Deploy**: Push changes to production

3. **Users update**: 
   - Uninstall old combined app
   - Install new standalone apps from new URLs

4. **Monitor**: Check browser DevTools → Application tab for service workers and caches

## Legacy Compatibility

The old entry points can be kept for backwards compatibility:
- `/buszy.html` → redirects to `/buszy/`
- `/rail-buddy.html` → redirects to `/rail-buddy/`

Or delete them if not needed:
```bash
rm buszy.html
rm rail-buddy.html
rm service-worker.js          # Old shared SW
```

## Summary

✅ **Fully Separated**: Each app has its own entry point, service worker, and cache
✅ **Independent Installation**: Users install each app separately
✅ **Independent Updates**: Update one app without affecting the other
✅ **Scoped Service Workers**: Prevents cache conflicts
✅ **Better User Experience**: Apps run independently on user devices
✅ **Easy Maintenance**: Cleaner project structure

---

For questions about PWA features, refer to [PWA-SETUP.md](../PWA-SETUP.md)
