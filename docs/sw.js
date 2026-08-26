// Simple service worker to cache app shell for offline / add-to-home
const CACHE_NAME = '219-empire-v1';
const ASSETS = [
  './',
  './index.html',
  './src/main.js',
  './assets/map-placeholder.png',
  './assets/pin.png',
  './assets/town.png',
  './assets/lighthouse.png',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
