// Self-destruct service worker - clears all caches and unregisters itself
// This fixes issues with stale cached content being served

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    // Clear all caches
    caches.keys()
      .then((cacheNames) => {
        console.log('SW: Clearing all caches:', cacheNames);
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log('SW: Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
      .then(() => {
        console.log('SW: All caches cleared, unregistering service worker...');
        return self.registration.unregister();
      })
      .then(() => {
        console.log('SW: Service worker unregistered');
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('SW: Cleanup failed:', error);
      })
  );
});

// Do nothing on fetch - let browser handle all requests normally
self.addEventListener('fetch', () => {
  // Intentionally empty - no caching, no interception
  return;
});
