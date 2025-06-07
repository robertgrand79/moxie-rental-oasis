
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

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle images
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) return response;
          
          return fetch(request).then((fetchResponse) => {
            const responseClone = fetchResponse.clone();
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
            return fetchResponse;
          });
        })
    );
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          if (response.ok) {
            caches.open(CACHE_NAME)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((response) => response || fetch(request))
  );
});
