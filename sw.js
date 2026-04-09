
// MedDireto PWA Service Worker
// Strategy: Network Only (No offline caching for maximum data security)

const CACHE_NAME = 'meddireto-v1';

self.addEventListener('install', (event) => {
  // Forces the waiting service worker to become the active service worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Allows the service worker to begin controlling the client immediately.
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Strategy: Network Only
  // We do not cache any requests. If network is down, request fails.
  event.respondWith(fetch(event.request));
});
