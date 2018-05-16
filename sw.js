const STATIC_CACHE_NAME = "ctu-cps-v1";
const STATIC_URLS = [
      '/',
      '/app.js',
      '/apple-touch-icon-114x114.png',
      '/apple-touch-icon-120x120.png',
      '/apple-touch-icon-144x144.png',
      '/apple-touch-icon-152x152.png',
      '/apple-touch-icon-57x57.png',
      '/apple-touch-icon-60x60.png',
      '/apple-touch-icon-72x72.png',
      '/apple-touch-icon-76x76.png',
      '/fuse.min.js',
      '/index.html',
      '/manifest.json',
      '/ppwa.css',
      '/sw.js',
      '/icons/splash-512x596.png',
      '/icons/favicon.ico',
      '/icons/favicon-128.png',
      '/icons/favicon-16x16.png',
      '/icons/favicon-196x196.png',
      '/icons/favicon2.ico',
      '/icons/favicon-32x32.png',
      '/icons/favicon-96x96.png',
      '/icons/mstile-144x144.png',
      '/icons/mstile-150x150.png',
      '/icons/mstile-310x150.png',
      '/icons/mstile-310x310.png',
      '/icons/mstile-70x70.png',
      '/jquery/jquery-3.3.1.min.js',
      '/tablesaw/tablesaw.jquery.js',
      '/tablesaw/tablesaw-init.js'
];
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_URLS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.includes("ctu-cps") && name !== STATIC_CACHE_NAME)
          .map(name => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  );
});
