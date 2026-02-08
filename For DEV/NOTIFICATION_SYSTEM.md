# Notification System Documentation

## Overview

The refactored notification system is a centralized, modular solution that provides:

- **Push Notifications** (PWA and browser-based)
- **In-App Toast Notifications** (visual feedback)
- **Sound and Vibration Alerts** (mobile)
- **Offline Support** (notification queuing)
- **Cross-Platform Support** (web, mobile, PWA)
- **Multiple Notification Types** (arrival, alert, success, info, warning)

## Architecture

### Core Components

#### 1. **NotificationManager** (`/js/notificationManager.js`)
The main class responsible for:
- Managing notification permissions
- Sending push notifications via Service Worker or direct API
- Displaying in-app toasts
- Playing sound alerts
- Triggering vibrations
- Handling offline/online state
- Queuing notifications for offline delivery

#### 2. **Service Worker** (`/service-worker.js`)
Enhanced to handle:
- `SHOW_NOTIFICATION` - Display push notifications
- `CLEAR_NOTIFICATIONS` - Clear notifications by tag
- `notificationclick` - Handle notification interactions
- `notificationclose` - Log notification closures

#### 3. **App Integration** (buszy/js/art.js, rail-buddy/*)
Uses NotificationManager API for:
- Requesting permissions
- Sending notifications
- Managing preferences
- Displaying toasts

## Usage

### Basic Setup

1. **Include the script** in your HTML:
```html
<script src="../js/notificationManager.js"></script>
<script src="js/your-app.js"></script>
```

2. **Access the global instance**:
```javascript
// NotificationManager is automatically initialized
notificationManager.notify(title, options, type);
```

### Sending Notifications

#### Simple Notification
```javascript
notificationManager.notify(
    'Bus 105 Arrives Now!',
    { body: 'Your monitored bus has arrived.' },
    'ARRIVAL'
);
```

#### With All Options
```javascript
notificationManager.notify(
    'Important Alert',
    {
        body: 'Description of the notification',
        icon: '/path/to/icon.png',
        tag: 'unique-tag',
        data: {
            customData: 'value',
            busStopCode: '45321'
        },
        color: '#FF9800'
    },
    'ALERT'
);
```

### Notification Types

```javascript
// ARRIVAL - High priority bus arrival (6s, orange, vibration pattern)
notificationManager.notify('Bus Arrived', {...}, 'ARRIVAL');

// ALERT - High priority alert (5s, red, bell pattern vibration)
notificationManager.notify('System Alert', {...}, 'ALERT');

// SUCCESS - Positive feedback (3s, green, single vibration)
notificationManager.notify('Success', {...}, 'SUCCESS');

// INFO - Information (3s, blue, no vibration)
notificationManager.notify('Information', {...}, 'INFO');

// WARNING - Warning message (4s, orange, warning vibration)
notificationManager.notify('Warning', {...}, 'WARNING');
```

### Toast Notifications

```javascript
// Show inline toast
notificationManager.showToast('Operation completed', 'SUCCESS');

// Or use legacy wrapper
showToast('Message', 'success'); // Maps to 'SUCCESS'
```

### Permission Management

```javascript
// Request permission
await notificationManager.requestPermission();

// Check permission status
console.log(notificationManager.permissions.notification);
// Returns: 'granted', 'denied', or 'default'

// Get device capabilities
const device = notificationManager.getDeviceInfo();
// {
//   isAndroid: boolean,
//   isIOS: boolean,
//   isDesktop: boolean,
//   isPWA: boolean,
//   isOnline: boolean,
//   hasServiceWorker: boolean,
//   hasNotificationAPI: boolean,
//   hasVibration: boolean
// }
```

### Preference Management

```javascript
// Save preference
notificationManager.savePreference('monitoredServices', {
    '105': true,
    '106': false
});

// Get preference
const services = notificationManager.getPreference('monitoredServices');
```

### Offline Support

Notifications are automatically queued when offline:

```javascript
// Listen to online/offline events
window.addEventListener('online', () => {
    console.log('App is online');
    // Queued notifications are processed automatically
});

// Manually process queue
notificationManager.processQueue();
```

### Sound and Vibration

```javascript
// Play sound
notificationManager.playSound('arrival.mp3');

// Vibrate device
notificationManager.vibrate([200, 100, 200]); // pattern in ms

// Disable auto-play
notificationManager.config.autoPlay = false;
notificationManager.notify('Silent notification', {...}, 'INFO');
```

### Debug Mode

```javascript
// Enable debug logging
notificationManager.enableDebug(true);

// Disable debug logging
notificationManager.enableDebug(false);
```

## Integration Examples

### Bus Arrival Notifications

```javascript
notificationManager.notify(
    `Bus ${serviceNo} Arrives Now!`,
    {
        body: `Your monitored bus has arrived at ${busStopDescription}`,
        tag: `bus-${serviceNo}`,
        data: {
            busStopCode,
            serviceNo,
            type: 'arrival'
        }
    },
    'ARRIVAL'
);
```

### Error Alerts

```javascript
notificationManager.notify(
    'Connection Error',
    {
        body: 'Failed to fetch bus data. Retrying...',
        tag: 'error',
        requireInteraction: true
    },
    'ALERT'
);
```

### Success Messages

```javascript
notificationManager.notify(
    'Settings Saved',
    {
        body: 'Your preferences have been updated.',
        tag: 'settings'
    },
    'SUCCESS'
);
```

## Configuration

### Customize Sound Directory

```javascript
notificationManager.config.soundDir = '/custom/audio/path/';
```

### Customize Icons

```javascript
notificationManager.config.defaultIcon = '/custom/icon.png';
notificationManager.config.defaultBadge = '/custom/badge.png';
```

### Add Custom Notification Type

```javascript
notificationManager.notificationTypes.CUSTOM = {
    priority: 'normal',
    duration: 5000,
    sound: 'custom.mp3',
    vibration: [100, 50, 100],
    color: '#9C27B0'
};

notificationManager.notify('Custom Alert', {...}, 'CUSTOM');
```

## Platform-Specific Behavior

### Desktop/Web
- ✅ Push notifications (if Service Worker ready)
- ✅ In-app toasts
- ❌ Vibration
- ✅ Sound (if browser allows)

### Mobile (Native App)
- ✅ Push notifications
- ✅ In-app toasts
- ✅ Vibration
- ✅ Sound

### PWA (Standalone)
- ✅ Full push notifications
- ✅ In-app toasts
- ✅ Vibration (Android)
- ✅ Sound

## Best Practices

1. **Always request permission on user action** - Never request without user interaction
   ```javascript
   button.addEventListener('click', async () => {
       await notificationManager.requestPermission();
   });
   ```

2. **Use appropriate notification types** - Choose the right type for the context
   ```javascript
   // For time-sensitive events (arrivals)
   notificationManager.notify(..., 'ARRIVAL');
   
   // For user actions
   notificationManager.notify(..., 'SUCCESS');
   ```

3. **Include context in data** - Always add relevant data
   ```javascript
   notificationManager.notify(title, {
       data: {
           busStopCode: '45321',
           serviceNo: '105',
           timestamp: new Date().toISOString()
       }
   }, type);
   ```

4. **Use tags for grouping** - Prevent notification spam
   ```javascript
   notificationManager.notify(title, {
       tag: `bus-${serviceNo}`, // Replace previous for this service
   }, 'ARRIVAL');
   ```

5. **Handle offline gracefully** - Queue will be processed automatically
   ```javascript
   // No special handling needed, done automatically
   notificationManager.notify('Message', {...}, 'INFO');
   ```

6. **Test permission states** - Check before sending
   ```javascript
   if (notificationManager.permissions.notification === 'granted') {
       notificationManager.notify(...);
   }
   ```

## Troubleshooting

### Notifications not showing
1. Check permission: `notificationManager.permissions.notification`
2. Enable debug: `notificationManager.enableDebug(true)`
3. Check browser console for errors
4. Verify Service Worker is registered

### Sound not playing
1. Check `notificationManager.config.autoPlay`
2. Verify audio file path in `config.soundDir`
3. Check browser audio permissions

### Vibration not working
1. Only works on mobile/PWA
2. Check `notificationManager.permissions.vibration`
3. Verify device supports vibration API

### Offline notifications
1. Queued automatically
2. Check `notificationManager.notificationQueue`
3. Processed when online

## Migration Guide

### From Old System to New

**Old Code:**
```javascript
sendNotification('Title', { body: 'message' });
showToast('message', 'success');
```

**New Code:**
```javascript
notificationManager.notify('Title', { body: 'message' }, 'INFO');
notificationManager.showToast('message', 'SUCCESS');
```

**Replace notification preferences:**
```javascript
// Old
getNotificationPreference('key');
saveNotificationPreference('key', value);

// New
notificationManager.getPreference('key');
notificationManager.savePreference('key', value);
```

## Files Modified/Created

- **Created**: `/js/notificationManager.js` - Main notification system
- **Updated**: `/service-worker.js` - Enhanced message handling
- **Updated**: `/buszy/art.html` - Added script reference
- **Updated**: `/buszy/js/art.js` - Integrated notification system
- **Updated**: `/rail-buddy/*.html` - Added script references (optional)

## Future Enhancements

- [ ] Notification channels (Android)
- [ ] Rich notifications with images
- [ ] Notification groups/summaries
- [ ] Advanced analytics
- [ ] Custom notification sounds per event type
- [ ] Notification scheduling
- [ ] Background sync for offline notifications
