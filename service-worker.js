self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  // Simple pass-through for now
});

// Handle messages from the client (main application)
self.addEventListener('message', event => {
    if (!event.data) return;

    switch (event.data.type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;

        case 'SHOW_NOTIFICATION':
            handleShowNotification(event.data);
            break;

        default:
            console.log('Unknown message type:', event.data.type);
    }
});

// Handle showing notifications
function handleShowNotification(data) {
    const { title, options = {} } = data;

    if (!title) {
        console.error('Notification title is required');
        return;
    }

    // Set default notification options
    const notificationOptions = {
        icon: options.icon || '/img/core-img/icon-192.png',
        badge: options.badge || '/img/core-img/icon-192.png',
        tag: options.tag || 'bus-notification',
        requireInteraction: options.requireInteraction !== undefined ? options.requireInteraction : false,
        ...options
    };

    // Show the notification
    self.registration.showNotification(title, notificationOptions)
        .catch(error => {
            console.error('Error showing notification:', error);
        });
}

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    // Handle notification click - focus existing window or open new one
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(clientList => {
                // Check if a window with the target URL is already open
                for (let client of clientList) {
                    if (client.url === self.location.origin + '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                // If no window is open, open a new one
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
    );
});

// Handle notification close
self.addEventListener('notificationclose', event => {
    console.log('Notification closed:', event.notification.tag);
});