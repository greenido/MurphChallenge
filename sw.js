/**
 * Service Worker for Murph Challenge Tracker PWA
 */

const CACHE_NAME = 'murph-tracker-v1';
const ASSETS_TO_CACHE = [
  '/MurphChallenge/',
  '/MurphChallenge/index.html',
  '/MurphChallenge/js/app.js',
  '/MurphChallenge/js/timer.js',
  '/MurphChallenge/js/storage.js',
  '/MurphChallenge/js/confetti.js',
  '/MurphChallenge/manifest.json'
];

// External resources to cache
const EXTERNAL_ASSETS = [
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

/**
 * Install event - cache assets
 */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // Try to cache external assets, but don't fail if they don't work
        return caches.open(CACHE_NAME)
          .then((cache) => {
            return Promise.allSettled(
              EXTERNAL_ASSETS.map(url => 
                fetch(url).then(response => {
                  if (response.ok) {
                    return cache.put(url, response);
                  }
                }).catch(() => {})
              )
            );
          });
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * Activate event - clean old caches
 */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

/**
 * Fetch event - serve from cache, fallback to network
 */
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the new resource
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If both cache and network fail, return a fallback
            if (event.request.destination === 'document') {
              return caches.match('/MurphChallenge/index.html');
            }
          });
      })
  );
});

/**
 * Background sync for future features
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-workout') {
    // Future: sync workout data to server
    console.log('Background sync triggered');
  }
});
