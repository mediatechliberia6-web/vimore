/**
 * ViMore Service Worker
 * - Precaches the app shell and core icons
 * - Cache-First for media & static assets
 * - Network-First with cache fallback for page navigation
 * - Offline fallback page when network and cache both fail
 */

const SW_VERSION = 'v5';
const MEDIA_CACHE = `vimore-media-${SW_VERSION}`;
const PAGE_CACHE = `vimore-pages-${SW_VERSION}`;
const STATIC_CACHE = `vimore-static-${SW_VERSION}`;
const CACHE_NAMES = [MEDIA_CACHE, PAGE_CACHE, STATIC_CACHE];

const OFFLINE_URL = '/offline.html';

const APP_SHELL_URLS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

const MEDIA_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg',
  '.mp4', '.webm', '.ogv',
  '.mp3', '.ogg', '.wav', '.aac', '.m4a', '.flac', '.opus',
];

const STATIC_EXTENSIONS = ['.css', '.js', '.woff', '.woff2', '.ttf', '.otf'];

const APPWRITE_FILE_PATTERNS = [
  '/v1/storage/buckets/',
  '/files/',
];

const SKIP_PATTERNS = [
  '/_next/webpack-hmr',
  '/api/',
  'chrome-extension://',
  'hot-update',
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

function isStaticAsset(url) {
  try {
    const parsed = new URL(url);
    const lower = parsed.pathname.toLowerCase().split('?')[0];
    return STATIC_EXTENSIONS.some(ext => lower.endsWith(ext));
  } catch {
    return false;
  }
}

function isNavigationRequest(request) {
  return request.mode === 'navigate';
}

// ─── Install: precache app shell ──────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE).then((cache) =>
      Promise.all(
        APP_SHELL_URLS.map((url) =>
          cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ─── Activate: cleanup old caches ─────────────────────────────────────────────
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

  // Static assets (css/js/fonts): cache-first
  if (isStaticAsset(url) && url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) cache.put(request, response.clone());
          return response;
        } catch {
          return cached || new Response('Asset unavailable', { status: 503 });
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
          if (response.ok) {
            const cloned = response.clone();
            caches.open(PAGE_CACHE).then(cache => cache.put(request, cloned)).catch(() => {});
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          const offlineCached = await caches.match(OFFLINE_URL);
          if (offlineCached) return offlineCached;
          return new Response('You are offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        })
    );
    return;
  }

  // Other same-origin GETs: network-first with cache fallback
  if (url.startsWith(self.location.origin)) {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(request);
        return cached || new Response('Offline', { status: 503 });
      })
    );
  }
});

// ─── Messages: manual cache + badge control ───────────────────────────────────
self.addEventListener('message', (event) => {
  const data = event.data || {};

  if (data.type === 'CLEAR_MEDIA_CACHE') {
    caches.delete(MEDIA_CACHE).then(() => {
      event.source?.postMessage({ type: 'MEDIA_CACHE_CLEARED' });
    });
  }
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  // Badge sync from the client — pass a numeric count
  if (data.type === 'SET_BADGE') {
    const count = Number(data.count) || 0;
    try {
      if (count > 0 && self.navigator.setAppBadge) {
        self.navigator.setAppBadge(count).catch(() => {});
      } else if (self.navigator.clearAppBadge) {
        self.navigator.clearAppBadge().catch(() => {});
      }
    } catch {}
  }
  if (data.type === 'CLEAR_BADGE') {
    try {
      if (self.navigator.clearAppBadge) self.navigator.clearAppBadge().catch(() => {});
    } catch {}
  }
});

// ─── Push notifications ───────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: 'ViMore', body: event.data ? event.data.text() : '' };
  }

  const title = payload.title || 'ViMore';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/icon-192.png',
    image: payload.image,
    tag: payload.tag || 'vimore-notification',
    renotify: Boolean(payload.renotify),
    requireInteraction: Boolean(payload.requireInteraction),
    silent: Boolean(payload.silent),
    vibrate: payload.vibrate || [120, 60, 120],
    timestamp: payload.timestamp || Date.now(),
    data: {
      url: payload.url || '/notifications',
      ...payload.data,
    },
    actions: payload.actions || [],
  };

  event.waitUntil(
    (async () => {
      try {
        await self.registration.showNotification(title, options);
      } catch {}
      // Bump the app icon badge
      try {
        if (self.navigator.setAppBadge) {
          const count = Number(payload.badgeCount);
          if (count > 0) await self.navigator.setAppBadge(count);
          else await self.navigator.setAppBadge();
        }
      } catch {}
      // Let any open clients know to refresh their unread counters
      const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clientsList.forEach((c) => c.postMessage({ type: 'PUSH_RECEIVED', payload }));
    })()
  );
});

// ─── Notification click: focus or open the app ────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  const data = event.notification.data || {};
  const targetUrl = data.url || '/';

  event.notification.close();

  // "Reply" inline text action (Android Chrome): send the typed message
  if (action === 'reply') {
    const replyText = (event.reply || '').trim();
    event.waitUntil(
      (async () => {
        if (replyText && data.recipientId && data.senderId && data.clusterId) {
          try {
            // The "sender" of the reply is the current user (the one who received
            // the original push), and the receiver is the original message's sender.
            await fetch('/api/messages/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                senderId: data.recipientId,
                receiverId: data.senderId,
                clusterId: data.clusterId,
                text: replyText,
              }),
              keepalive: true,
            });
            // Also mark the original messages as read since the user just replied
            await fetch('/api/messages/mark-read', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipientId: data.recipientId,
                senderId: data.senderId,
                clusterId: data.clusterId,
              }),
              keepalive: true,
            });
          } catch {}
        }
        try { if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge(); } catch {}
        const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        clientsList.forEach((c) => c.postMessage({
          type: 'QUICK_REPLY_SENT',
          clusterId: data.clusterId,
          senderId: data.senderId,
          text: replyText,
        }));
      })()
    );
    return;
  }

  // "Mark as read" action: silently mark messages read without opening the app
  if (action === 'mark-read') {
    event.waitUntil(
      (async () => {
        try {
          await fetch('/api/messages/mark-read', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientId: data.recipientId,
              senderId: data.senderId,
              clusterId: data.clusterId,
            }),
            keepalive: true,
          });
        } catch {}
        // Update badge & inform any open clients
        try {
          if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge();
        } catch {}
        const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        clientsList.forEach((c) => c.postMessage({
          type: 'MESSAGES_MARKED_READ',
          senderId: data.senderId,
          clusterId: data.clusterId,
        }));
      })()
    );
    return;
  }

  // Default click (or "open" action): focus / navigate the app
  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        try {
          const clientUrl = new URL(client.url);
          if (clientUrl.origin === self.location.origin && 'focus' in client) {
            client.postMessage({ type: 'NOTIFICATION_CLICK', url: targetUrl });
            await client.focus();
            if ('navigate' in client) {
              try { await client.navigate(targetUrl); } catch {}
            }
            return;
          }
        } catch {}
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(targetUrl);
      }
    })()
  );
});

// ─── Subscription changed: client will re-subscribe ───────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsList) => {
      clientsList.forEach((c) => c.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' }));
    })
  );
});
