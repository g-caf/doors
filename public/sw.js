const CACHE_NAME = 'guest-checkin-v1';
const STATIC_ASSETS = [
  '/public/BLANKSLATE.pdf.png',
  '/public/primary-dark-mode.svg',
  '/public/favicon.png',
  '/public/Adrienne%20Caffarel.png',
  '/public/Beyang%20Liu.png',
  '/public/Dan%20Adler.png',
  '/public/Madison%20Clark.png',
  '/public/Quinn%20Slack.png'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/public/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((fetchResponse) => {
          const responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return fetchResponse;
        });
      })
    );
  }
});
