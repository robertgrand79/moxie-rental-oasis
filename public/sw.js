
const CACHE_NAME = 'moxie-rental-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png', // Logo
];

const CACHE_STRATEGIES = {
  images: 'cache-first',
  api: 'network-first',
  static: 'cache-first'
};

// Install event with better error handling
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_CACHE_URLS).catch((error) => {
          console.warn('SW: Failed to cache some resources during install:', error);
          // Continue installation even if some resources fail to cache
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('SW: Install failed:', error);
      })
  );
});

// Activate event with better cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
      .catch((error) => {
        console.error('SW: Activation failed:', error);
      })
  );
});

// Enhanced fetch event with better error handling
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle images with better error handling
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) return response;
          
          return fetch(request)
            .then((fetchResponse) => {
              // Only cache successful responses
              if (fetchResponse.ok && fetchResponse.status === 200) {
                const responseClone = fetchResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => cache.put(request, responseClone))
                  .catch((error) => {
                    console.warn('SW: Failed to cache image:', error);
                  });
              }
              return fetchResponse;
            })
            .catch((error) => {
              console.warn('SW: Failed to fetch image:', error);
              // Return a fallback or let it fail gracefully
              return new Response('', { status: 404, statusText: 'Not Found' });
            });
        })
        .catch((error) => {
          console.warn('SW: Cache match failed for image:', error);
          return fetch(request);
        })
    );
    return;
  }

  // Handle API requests with better error handling
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful API responses
          if (response.ok && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone))
              .catch((error) => {
                console.warn('SW: Failed to cache API response:', error);
              });
          }
          return response;
        })
        .catch((networkError) => {
          console.warn('SW: Network failed for API request, trying cache:', networkError);
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return a proper error response instead of undefined
              return new Response(
                JSON.stringify({ error: 'Network unavailable' }), 
                { 
                  status: 503, 
                  statusText: 'Service Unavailable',
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Handle static assets with better error handling
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) return response;
        
        return fetch(request).catch((error) => {
          console.warn('SW: Failed to fetch static asset:', error);
          // Let the browser handle the error naturally
          throw error;
        });
      })
      .catch((error) => {
        console.warn('SW: Cache and network both failed:', error);
        // Return a basic 404 response
        return new Response('', { status: 404, statusText: 'Not Found' });
      })
  );
});

// Handle service worker errors
self.addEventListener('error', (event) => {
  console.error('SW: Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('SW: Unhandled promise rejection:', event.reason);
  event.preventDefault();
});
