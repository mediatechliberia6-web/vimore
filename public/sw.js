/**
 * ViMore Service Worker
 * Cache-First strategy for all media assets (images, video, audio).
 * Media is cached on first fetch and served from the device on every subsequent request.
 */

const MEDIA_CACHE = 'vimore-media-v1';
const CACHE_NAMES = [MEDIA_CACHE];

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

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', () => {
  self.skipWaiting();
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

// ─── Fetch: Cache-First for media ─────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = request.url;

  if (request.method !== 'GET') return;
  if (shouldSkip(url)) return;
  if (!isMediaUrl(url)) return;

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
