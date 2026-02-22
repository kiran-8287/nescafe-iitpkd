const CACHE_NAME = 'nescafe-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.ico'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    // Only intercept GET requests to avoid issues with POST/auth calls
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then(response => response || fetch(event.request))
    );
});
