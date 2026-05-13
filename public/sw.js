/**
 * ViMore Service Worker
 * - Precaches the app shell and core icons
 * - Cache-First for media & static assets
 * - Network-First with cache fallback for page navigation
 * - Offline fallback page when network and cache both fail
 */

const SW_VERSION = 'v8';
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

// ─── Activate: cleanup old caches, then notify all open tabs ──────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys.filter(k => !CACHE_NAMES.includes(k)).map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
      .then(async () => {
        // Tell every open tab that a new version just took over so it can
        // prompt the user to reload and see the latest UI.
        const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        clientsList.forEach(client => client.postMessage({ type: 'SW_UPDATED', version: SW_VERSION }));
      })
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

  // Navigation: network-first with 4-second timeout, cache fallback.
  // This ensures users always get the latest HTML after a deploy.
  // Falls back to cached page when offline or when the network is too slow.
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(PAGE_CACHE);
        try {
          const networkResponse = await Promise.race([
            fetch(request),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), 4000)
            ),
          ]);
          if (networkResponse.ok) {
            try { cache.put(request, networkResponse.clone()); } catch {}
          }
          return networkResponse;
        } catch {
          // Network failed or timed out — serve from cache
          const cached = await cache.match(request);
          if (cached) return cached;
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
          const offlineCached = await caches.match(OFFLINE_URL);
          if (offlineCached) return offlineCached;
          return new Response('You are offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
        }
      })()
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

  const isCallPush = payload.data && payload.data.type === 'incoming-call';

  const title = payload.title || 'ViMore';
  const options = {
    body: payload.body || '',
    icon: payload.icon || '/icons/icon-192.png',
    badge: payload.badge || '/icons/icon-192.png',
    image: payload.image,
    tag: payload.tag || 'vimore-notification',
    renotify: Boolean(payload.renotify),
    // Call notifications must stay on screen until the user acts
    requireInteraction: isCallPush ? true : Boolean(payload.requireInteraction),
    silent: Boolean(payload.silent),
    // Call notifications use a longer, more urgent vibration pattern
    vibrate: isCallPush ? [300, 100, 300, 100, 300] : (payload.vibrate || [120, 60, 120]),
    timestamp: payload.timestamp || Date.now(),
    data: {
      url: payload.url || '/notifications',
      ...payload.data,
    },
    // Call notifications get Accept / Decline inline actions
    actions: isCallPush
      ? [
          { action: 'accept-call', title: '✅ Accept' },
          { action: 'decline-call', title: '❌ Decline' },
        ]
      : (payload.actions || []),
  };

  event.waitUntil(
    (async () => {
      // If a call push arrives while the app is in the foreground, just relay
      // the payload to the open client — the CallContext realtime listener will
      // already have shown the in-app overlay.  We still show the OS notification
      // so the user sees it if they happen to be looking at another app.
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
      // Let any open clients know to refresh their unread counters (or show call overlay)
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

  // ── Incoming call: Accept ─────────────────────────────────────────────────
  if (action === 'accept-call') {
    event.waitUntil(
      (async () => {
        const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        // Tell an existing app window to trigger the accept flow
        for (const client of allClients) {
          try {
            const clientUrl = new URL(client.url);
            if (clientUrl.origin === self.location.origin && 'focus' in client) {
              client.postMessage({
                type: 'CALL_ACTION',
                action: 'accept',
                callDocId: data.callDocId,
                callType: data.callType,
                callerName: data.callerName,
                callerAvatar: data.callerAvatar,
              });
              await client.focus();
              return;
            }
          } catch {}
        }
        // No open window — open the app and pass the action via URL param
        if (self.clients.openWindow) {
          const url = `/messages?call_action=accept&call_doc_id=${encodeURIComponent(data.callDocId || '')}&call_type=${encodeURIComponent(data.callType || 'audio')}&caller_name=${encodeURIComponent(data.callerName || '')}`;
          await self.clients.openWindow(url);
        }
      })()
    );
    return;
  }

  // ── Incoming call: Decline ────────────────────────────────────────────────
  if (action === 'decline-call') {
    event.waitUntil(
      (async () => {
        if (data.callDocId) {
          try {
            await fetch('/api/call/decline', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ callDocId: data.callDocId }),
              keepalive: true,
            });
          } catch {}
        }
        // Inform any open clients so they can dismiss the overlay too
        const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        clientsList.forEach((c) => c.postMessage({ type: 'CALL_ACTION', action: 'decline', callDocId: data.callDocId }));
      })()
    );
    return;
  }

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
