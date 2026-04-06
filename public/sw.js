/**
 * ViMore Service Worker
 * - Cache-First for media assets (images, video, audio)
 * - Network-First with cache fallback for page navigation
 * - Offline page when network fails and no cache exists
 */

const MEDIA_CACHE = 'vimore-media-v2';
const PAGE_CACHE = 'vimore-pages-v2';
const CACHE_NAMES = [MEDIA_CACHE, PAGE_CACHE];

const OFFLINE_URL = '/offline.html';

const APP_SHELL_URLS = [
  '/',
  '/offline.html',
];

const MEDIA_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg',
  '.mp4', '.webm', '.ogv',
  '.mp3', '.ogg', '.wav', '.aac', '.m4a', '.flac', '.opus',
];

const APPWRITE_FILE_PATTERNS = [
  '/v1/storage/buckets/',
  '/files/',
];

const SKIP_PATTERNS = [
  '/_next/',
  '/api/',
  'chrome-extension://',
  'hot-update',
  'localhost',
];

function shouldSkip(url) {
  return SKIP_PATTERNS.some(p => url.includes(p));
}

function isMediaUrl(url) {
  try {
    const parsed = new URL(url);
    const lower = parsed.pathname.toLowerCase().split('?')[0];
    const hostname = parsed.hostname;
    if (MEDIA_EXTENSIONS.some(ext => lower.endsWith(ext))) return true;
    if (APPWRITE_FILE_PATTERNS.some(p => lower.includes(p))) return true;
    if (hostname === 'picsum.photos') return true;
    if (hostname.includes('appwrite.io') || hostname.includes('appwrite.cloud')) return true;
    return false;
  } catch {
    return false;
  }
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// ─── Install: cache app shell ─────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL_URLS).catch(() => {});
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate: delete old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys.filter(k => !CACHE_NAMES.includes(k)).map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  if (request.method !== 'GET') return;
  if (shouldSkip(url)) return;

  // Media: cache-first
  if (isMediaUrl(url)) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          return new Response('Media unavailable offline', { status: 503 });
        }
      })
    );
    return;
  }

  // Navigation: network-first, fall back to cache, then offline page
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful navigations for offline use
          if (response.ok) {
            const cloned = response.clone();
            caches.open(PAGE_CACHE).then(cache => cache.put(request, cloned)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          // Offline: try cache first
          const cached = await caches.match(request);
          if (cached) return cached;
          // Fall back to root (SPA routing)
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          // Last resort: offline page
          const offlineCached = await caches.match(OFFLINE_URL);
          if (offlineCached) return offlineCached;
          return new Response('You are offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // Other same-origin requests: network-first with cache fallback
  if (url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        return cached || new Response('Offline', { status: 503 });
      })
    );
  }
});

// ─── Messages: manual cache control ──────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_MEDIA_CACHE') {
    caches.delete(MEDIA_CACHE).then(() => {
      event.source?.postMessage({ type: 'MEDIA_CACHE_CLEARED' });
    });
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
