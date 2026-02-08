# Notification System - Implementation Examples

## Common Use Cases

### 1. Bus Arrival Notification

```javascript
// When a monitored bus is about to arrive
const serviceNo = '105';
const busStopCode = '45321';
const busStopName = 'Yew Tee Station';

notificationManager.notify(
    `Bus ${serviceNo} Arrives Now!`,
    {
        body: `Your monitored bus has arrived at ${busStopName}`,
        tag: `bus-${serviceNo}`,
        data: {
            busStopCode,
            serviceNo,
            type: 'arrival',
            timestamp: new Date().toISOString()
        },
        icon: '/img/core-img/bus-icon.png'
    },
    'ARRIVAL'
);
```

### 2. Delay Alert Notification

```javascript
// Notify user of train/bus delay
const trainLine = 'MRT Line';
const delayMinutes = 15;

notificationManager.notify(
    `${trainLine} Delay Alert`,
    {
        body: `${trainLine} is running ${delayMinutes} minutes late`,
        tag: 'delay-alert',
        data: {
            type: 'delay',
            line: trainLine,
            delayMinutes
        },
        requireInteraction: true // Keep notification visible
    },
    'ALERT'
);
```

### 3. Settings Updated Notification

```javascript
// Confirm settings have been saved
notificationManager.notify(
    'Settings Saved',
    {
        body: 'Your preferences have been updated successfully',
        tag: 'settings-saved',
        data: { type: 'settings' }
    },
    'SUCCESS'
);
```

### 4. Information Message

```javascript
// General information
notificationManager.notify(
    'Service Announcement',
    {
        body: 'Weekend service changes are now in effect',
        tag: 'announcement',
        data: { type: 'info' }
    },
    'INFO'
);
```

### 5. Warning Notification

```javascript
// Warn about something important
notificationManager.notify(
    'Maintenance Alert',
    {
        body: 'System maintenance scheduled for tonight',
        tag: 'maintenance',
        data: { type: 'maintenance' }
    },
    'WARNING'
);
```

## Advanced Integration Patterns

### Pattern 1: Request Permission on User Action

```javascript
// In your HTML
<button id="enable-notifications">Enable Notifications</button>

// In your JavaScript
document.getElementById('enable-notifications').addEventListener('click', async () => {
    const granted = await notificationManager.requestPermission();
    
    if (granted) {
        notificationManager.showToast('Notifications enabled', 'SUCCESS');
    } else {
        notificationManager.showToast('Notifications blocked', 'WARNING');
    }
});
```

### Pattern 2: Notification for Service Monitoring

```javascript
// Monitor a bus service
const monitoredServices = notificationManager.getPreference('monitoredServices') || {};

function toggleServiceMonitoring(serviceNo) {
    monitoredServices[serviceNo] = !monitoredServices[serviceNo];
    notificationManager.savePreference('monitoredServices', monitoredServices);
    
    const message = monitoredServices[serviceNo]
        ? `Now monitoring Bus ${serviceNo}`
        : `Stopped monitoring Bus ${serviceNo}`;
    
    notificationManager.notify(
        message,
        {
            body: '',
            tag: `service-${serviceNo}`
        },
        'INFO'
    );
}
```

### Pattern 3: Batch Notifications with Queuing

```javascript
// Queue multiple notifications
async function notifyUserOfMultipleArrivals(arrivals) {
    for (const arrival of arrivals) {
        notificationManager.notify(
            `Bus ${arrival.serviceNo} arriving`,
            {
                body: `Arriving at ${arrival.stopName} in ${arrival.minutesAway} minutes`,
                tag: `bus-${arrival.serviceNo}-${arrival.stopCode}`,
                data: arrival
            },
            'ARRIVAL'
        );
        
        // Small delay between notifications
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}
```

### Pattern 4: Notification with Action Data for Routing

```javascript
// Send notification that routes to specific page
notificationManager.notify(
    'Bus Schedule Updated',
    {
        body: 'Service 105 has schedule changes',
        tag: 'schedule-update',
        data: {
            type: 'schedule',
            serviceNo: '105',
            url: '/buszy/art.html?BusStopCode=45321'
        }
    },
    'INFO'
);
```

### Pattern 5: Error Handling with Notifications

```javascript
// Handle API errors with notifications
async function fetchBusData(serviceNo) {
    try {
        const response = await fetch(`/api/bus/${serviceNo}`);
        
        if (!response.ok) {
            throw new Error(`API returned ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        notificationManager.notify(
            'Error Loading Bus Data',
            {
                body: 'Failed to fetch current bus information. Retrying...',
                tag: `error-${serviceNo}`,
                data: {
                    type: 'error',
                    serviceNo,
                    error: error.message
                }
            },
            'ALERT'
        );
        
        return null;
    }
}
```

### Pattern 6: Device-Specific Notifications

```javascript
// Send different notifications based on device
function sendDeviceAwareNotification(title, options, type) {
    const device = notificationManager.getDeviceInfo();
    
    if (device.isAndroid || device.isIOS) {
        // Mobile: include vibration and sound
        notificationManager.notify(title, {
            ...options,
            data: { ...options.data, isMobile: true }
        }, type);
    } else if (device.isPWA) {
        // PWA: use full features
        notificationManager.notify(title, {
            ...options,
            data: { ...options.data, isPWA: true }
        }, type);
    } else {
        // Desktop web: basic notification
        notificationManager.notify(title, {
            ...options,
            data: { ...options.data, isWeb: true }
        }, type);
    }
}
```

### Pattern 7: Notification with Conditional Sound

```javascript
// Play sound only for important notifications
function notifyWithSound(title, options, type) {
    const isImportant = type === 'ARRIVAL' || type === 'ALERT';
    
    notificationManager.notify(title, {
        ...options,
        sound: isImportant ? `${type.toLowerCase()}.mp3` : null
    }, type);
}
```

### Pattern 8: Offline Notification Sync

```javascript
// Handle notifications when coming back online
window.addEventListener('online', async () => {
    notificationManager.showToast('Connection restored', 'SUCCESS');
    
    // Process any queued notifications
    await notificationManager.processQueue();
    
    // You can check the queue
    console.log('Processed notifications:', notificationManager.notificationQueue.length);
});
```

### Pattern 9: Duplicate Prevention with Tags

```javascript
// Use tags to replace previous notifications
function updateBusArrivalTime(serviceNo, minutesAway) {
    notificationManager.notify(
        `Bus ${serviceNo} - ${minutesAway} min away`,
        {
            body: `Real-time update`,
            tag: `bus-${serviceNo}`, // Same tag replaces previous
            data: {
                serviceNo,
                minutesAway,
                updated: new Date().toISOString()
            }
        },
        minutesAway <= 2 ? 'ALERT' : 'INFO'
    );
}
```

### Pattern 10: User Preference-Based Notifications

```javascript
// Respect user notification preferences
function smartNotify(title, options, type) {
    // Get user preferences
    const preferences = notificationManager.getPreference('notificationPrefs') || {};
    
    // Check if this type is enabled
    const typeKey = type.toLowerCase();
    if (preferences[typeKey] === false) {
        console.log(`Notifications of type ${type} are disabled by user`);
        return;
    }
    
    // Send notification
    notificationManager.notify(title, options, type);
}
```

## Service Worker Integration

### Handling Notification Clicks

```javascript
// In your main app, listen for message from service worker
navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'NOTIFICATION_CLICKED') {
        const data = event.data.data;
        
        // Route based on notification data
        if (data.type === 'arrival') {
            window.location.href = `/buszy/art.html?BusStopCode=${data.busStopCode}`;
        } else if (data.type === 'schedule') {
            window.location.href = `/buszy/art.html`;
        }
    }
});
```

## Testing Notifications

### Test in Console

```javascript
// Test all notification types
['ARRIVAL', 'ALERT', 'SUCCESS', 'INFO', 'WARNING'].forEach(type => {
    notificationManager.notify(
        `Test ${type}`,
        { body: `This is a ${type} notification` },
        type
    );
});

// Test device info
console.log('Device:', notificationManager.getDeviceInfo());

// Test preferences
notificationManager.savePreference('testKey', { test: 'value' });
console.log('Preference:', notificationManager.getPreference('testKey'));

// Test debug mode
notificationManager.enableDebug(true);
notificationManager.notify('Debug test', {}, 'INFO');

// Check queue
console.log('Notification Queue:', notificationManager.notificationQueue);

// Test offline
window.dispatchEvent(new Event('offline'));
console.log('Is Online:', notificationManager.isOnline);
```

## Best Practices Checklist

- ✅ Always request permission on user action
- ✅ Use appropriate notification types for context
- ✅ Include relevant data in notification objects
- ✅ Use tags to group related notifications
- ✅ Test on mobile devices for vibration/sound
- ✅ Handle offline scenarios gracefully
- ✅ Check device capabilities before using features
- ✅ Provide fallbacks for unsupported features
- ✅ Monitor notification delivery success
- ✅ Respect user notification preferences

## Debugging Tips

```javascript
// Enable debug mode for detailed logging
notificationManager.enableDebug(true);

// Check current state
console.log('Permission:', notificationManager.permissions.notification);
console.log('Is Online:', notificationManager.isOnline);
console.log('Service Worker Ready:', notificationManager.isServiceWorkerReady);
console.log('Device:', notificationManager.getDeviceInfo());
console.log('Queue:', notificationManager.notificationQueue);

// Manually trigger specific scenarios
// Offline scenario
notificationManager.isOnline = false;
// Then come back online
window.dispatchEvent(new Event('online'));

// Check permission states
['default', 'denied', 'granted'].forEach(state => {
    if (Notification.permission === state) {
        console.log('Current permission:', state);
    }
});
```
