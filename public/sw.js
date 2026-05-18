/**
 * ViMore Service Worker v11
 * - APP_SHELL_CACHE: permanent — Next.js static assets (JS/CSS/fonts)
 * - PAGE_CACHE: 5 h — full page HTML for offline navigation
 * - PINNED_CACHE: 24 h — audio/video intentionally played by the user
 * - MEDIA_CACHE: 5 h — all other images / media encountered while browsing
 * - Push notifications and badge control unchanged
 */

const SW_VERSION = 'v11';
const APP_SHELL_CACHE = `vimore-shell-${SW_VERSION}`;
const PAGE_CACHE      = `vimore-pages-${SW_VERSION}`;
const MEDIA_CACHE     = `vimore-media-${SW_VERSION}`;
const PINNED_CACHE    = `vimore-pinned-${SW_VERSION}`;
const CACHE_NAMES     = [APP_SHELL_CACHE, PAGE_CACHE, MEDIA_CACHE, PINNED_CACHE];

const MAX_PAGE_AGE_MS   = 5  * 60 * 60 * 1000;  // 5 h
const MAX_MEDIA_AGE_MS  = 5  * 60 * 60 * 1000;  // 5 h
const MAX_PINNED_AGE_MS = 24 * 60 * 60 * 1000;  // 24 h

// Pages/routes to pre-cache on install for guaranteed offline access
const PRECACHE_ROUTES = [
  '/',
  '/marketplace',
  '/reels',
  '/music',
  '/messages',
  '/notifications',
  '/menu',
  '/settings',
  '/search',
];

const MEDIA_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg',
  '.mp4', '.webm', '.ogv',
  '.mp3', '.ogg', '.wav', '.aac', '.m4a', '.flac', '.opus',
];

const APPWRITE_FILE_PATTERNS = ['/v1/storage/buckets/', '/files/'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isMediaUrl(url) {
  try {
    const parsed = new URL(url);
    const lower  = parsed.pathname.toLowerCase().split('?')[0];
    const host   = parsed.hostname;
    if (MEDIA_EXTENSIONS.some(ext => lower.endsWith(ext))) return true;
    if (APPWRITE_FILE_PATTERNS.some(p => lower.includes(p)))  return true;
    if (host === 'picsum.photos') return true;
    if (host.includes('appwrite.io') || host.includes('appwrite.cloud')) return true;
    return false;
  } catch { return false; }
}

function isStaticAsset(url) {
  try {
    const { pathname } = new URL(url);
    return pathname.startsWith('/_next/static/') || pathname.startsWith('/icons/') || pathname === '/manifest.json';
  } catch { return false; }
}

function isPageNavigation(request) {
  return request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

function stampResponse(response) {
  const headers = new Headers(response.headers);
  headers.set('sw-cached-at', String(Date.now()));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function isExpired(cachedResponse, maxAge) {
  const at = cachedResponse.headers.get('sw-cached-at');
  if (!at) return true;
  return (Date.now() - Number(at)) > maxAge;
}

async function purgeExpired(cacheName, maxAge) {
  try {
    const cache = await caches.open(cacheName);
    const keys  = await cache.keys();
    await Promise.all(
      keys.map(async req => {
        const res = await cache.match(req);
        if (res && isExpired(res, maxAge)) await cache.delete(req);
      })
    );
  } catch {}
}

// ─── Install — pre-cache the app shell and key routes ─────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      // Pre-cache Next.js static manifest and key routes
      try {
        const pageCache = await caches.open(PAGE_CACHE);
        await Promise.all(
          PRECACHE_ROUTES.map(async route => {
            try {
              const response = await fetch(route, { credentials: 'include' });
              if (response.ok) {
                await pageCache.put(route, stampResponse(response));
              }
            } catch {}
          })
        );
      } catch {}
      await self.skipWaiting();
    })()
  );
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(keys.filter(k => !CACHE_NAMES.includes(k)).map(k => caches.delete(k)))
      )
      .then(() => Promise.all([
        purgeExpired(PAGE_CACHE,   MAX_PAGE_AGE_MS),
        purgeExpired(MEDIA_CACHE,  MAX_MEDIA_AGE_MS),
        purgeExpired(PINNED_CACHE, MAX_PINNED_AGE_MS),
      ]))
      .then(() => self.clients.claim())
      .then(async () => {
        const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        clients.forEach(c => c.postMessage({ type: 'SW_UPDATED', version: SW_VERSION }));
      })
  );
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // ── 1. Static assets: cache-first, no expiry (versioned by Next.js) ──────
  if (isStaticAsset(request.url)) {
    event.respondWith(
      (async () => {
        const shellCache = await caches.open(APP_SHELL_CACHE);
        const cached = await shellCache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) shellCache.put(request, response.clone());
          return response;
        } catch {
          return new Response('Asset unavailable offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // ── 2. Page navigations: stale-while-revalidate with 5 h expiry ──────────
  if (isPageNavigation(request)) {
    event.respondWith(
      (async () => {
        const pageCache = await caches.open(PAGE_CACHE);
        const cached = await pageCache.match(request);

        // Kick off a background fetch to refresh the cache
        const networkFetch = fetch(request)
          .then(response => {
            if (response.ok) {
              pageCache.put(request, stampResponse(response.clone()));
            }
            return response;
          })
          .catch(() => null);

        // If we have a valid cached page, return it immediately
        if (cached && !isExpired(cached, MAX_PAGE_AGE_MS)) {
          return cached;
        }

        // Cache expired or missing — wait for network
        try {
          const fresh = await networkFetch;
          if (fresh) return fresh;
        } catch {}

        // Completely offline — serve stale cache if any
        if (cached) return cached;

        // Last resort: try the cached root page as app shell
        const rootCached = await pageCache.match('/');
        if (rootCached) return rootCached;

        return new Response(
          '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ViMore — Offline</title><style>*{box-sizing:border-box;margin:0}body{background:#050505;color:#fff;font-family:system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:16px;text-align:center;padding:24px}.icon{font-size:64px}.title{font-size:24px;font-weight:900;letter-spacing:-.05em;font-style:italic;text-transform:uppercase}.sub{font-size:14px;color:rgba(255,255,255,.5);max-width:280px;line-height:1.6}</style></head><body><div class="icon">📡</div><div class="title">No Connection</div><div class="sub">ViMore could not load this page. Check your connection and try again, or go back to a page you visited earlier.</div><br><button onclick="history.back()" style="background:#7c3aed;color:#fff;border:none;padding:12px 24px;border-radius:12px;font-weight:700;cursor:pointer;font-size:13px">Go Back</button></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
        );
      })()
    );
    return;
  }

  // ── 3. Media: cache-first with 5 h expiry ────────────────────────────────
  if (!isMediaUrl(request.url)) return;

  event.respondWith(
    (async () => {
      // Check pinned (24 h) cache first
      const pinnedCache = await caches.open(PINNED_CACHE);
      const pinned = await pinnedCache.match(request);
      if (pinned && !isExpired(pinned, MAX_PINNED_AGE_MS)) return pinned;
      if (pinned) pinnedCache.delete(request);

      // Check regular (5 h) media cache
      const mediaCache = await caches.open(MEDIA_CACHE);
      const cached = await mediaCache.match(request);
      if (cached && !isExpired(cached, MAX_MEDIA_AGE_MS)) return cached;
      if (cached) mediaCache.delete(request);

      // Fetch from network
      try {
        const response = await fetch(request);
        if (response.ok && response.status === 200) {
          mediaCache.put(request, stampResponse(response.clone()));
        }
        return response;
      } catch {
        // Offline — try either cache as fallback even if stale
        const stalePinned = await pinnedCache.match(request);
        if (stalePinned) return stalePinned;
        const staleMedia = await mediaCache.match(request);
        if (staleMedia) return staleMedia;
        return new Response('Media unavailable offline', { status: 503 });
      }
    })()
  );
});

// ─── Messages ─────────────────────────────────────────────────────────────────
self.addEventListener('message', event => {
  const data = event.data || {};

  if (data.type === 'PIN_MEDIA' && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(PINNED_CACHE).then(async cache => {
        for (const url of data.urls) {
          try {
            const existing = await cache.match(url);
            if (existing && !isExpired(existing, MAX_PINNED_AGE_MS)) continue;
            const response = await fetch(url, { mode: 'no-cors' });
            if (response.status === 0 || response.ok) {
              await cache.put(url, stampResponse(response));
            }
          } catch {}
        }
      })
    );
  }

  // Pre-cache specific page routes on demand
  if (data.type === 'PRECACHE_ROUTES' && Array.isArray(data.routes)) {
    event.waitUntil(
      caches.open(PAGE_CACHE).then(async cache => {
        for (const route of data.routes) {
          try {
            const existing = await cache.match(route);
            if (existing && !isExpired(existing, MAX_PAGE_AGE_MS)) continue;
            const response = await fetch(route, { credentials: 'include' });
            if (response.ok) await cache.put(route, stampResponse(response));
          } catch {}
        }
      })
    );
  }

  if (data.type === 'CLEAR_MEDIA_CACHE') {
    Promise.all([caches.delete(MEDIA_CACHE), caches.delete(PINNED_CACHE)]).then(() => {
      event.source?.postMessage({ type: 'MEDIA_CACHE_CLEARED' });
    });
  }

  // Clear ALL caches (pages + media + shell)
  if (data.type === 'CLEAR_ALL_CACHE') {
    Promise.all(CACHE_NAMES.map(n => caches.delete(n))).then(() => {
      event.source?.postMessage({ type: 'ALL_CACHE_CLEARED' });
    });
  }

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (data.type === 'SET_BADGE') {
    const count = Number(data.count) || 0;
    try {
      if (count > 0 && self.navigator.setAppBadge)  self.navigator.setAppBadge(count).catch(() => {});
      else if (self.navigator.clearAppBadge)         self.navigator.clearAppBadge().catch(() => {});
    } catch {}
  }
  if (data.type === 'CLEAR_BADGE') {
    try { if (self.navigator.clearAppBadge) self.navigator.clearAppBadge().catch(() => {}); } catch {}
  }
});

// ─── Push notifications ───────────────────────────────────────────────────────
self.addEventListener('push', event => {
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
    requireInteraction: isCallPush ? true : Boolean(payload.requireInteraction),
    silent: Boolean(payload.silent),
    vibrate: isCallPush ? [300, 100, 300, 100, 300] : (payload.vibrate || [120, 60, 120]),
    timestamp: payload.timestamp || Date.now(),
    data: { url: payload.url || '/notifications', ...payload.data },
    actions: isCallPush
      ? [{ action: 'accept-call', title: '✅ Accept' }, { action: 'decline-call', title: '❌ Decline' }]
      : (payload.actions || []),
  };

  event.waitUntil(
    (async () => {
      try { await self.registration.showNotification(title, options); } catch {}
      try {
        if (self.navigator.setAppBadge) {
          const count = Number(payload.badgeCount);
          if (count > 0) await self.navigator.setAppBadge(count);
          else await self.navigator.setAppBadge();
        }
      } catch {}
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach(c => c.postMessage({ type: 'PUSH_RECEIVED', payload }));
    })()
  );
});

// ─── Notification click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  const action = event.action;
  const data = event.notification.data || {};
  const targetUrl = data.url || '/';
  event.notification.close();

  if (action === 'accept-call') {
    event.waitUntil((async () => {
      const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of all) {
        try {
          const cu = new URL(client.url);
          if (cu.origin === self.location.origin && 'focus' in client) {
            client.postMessage({ type: 'CALL_ACTION', action: 'accept', callDocId: data.callDocId, callType: data.callType, callerName: data.callerName, callerAvatar: data.callerAvatar });
            await client.focus(); return;
          }
        } catch {}
      }
      if (self.clients.openWindow) {
        await self.clients.openWindow(`/messages?call_action=accept&call_doc_id=${encodeURIComponent(data.callDocId || '')}&call_type=${encodeURIComponent(data.callType || 'audio')}&caller_name=${encodeURIComponent(data.callerName || '')}`);
      }
    })());
    return;
  }

  if (action === 'decline-call') {
    event.waitUntil((async () => {
      if (data.callDocId) {
        try { await fetch('/api/call/decline', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callDocId: data.callDocId }), keepalive: true }); } catch {}
      }
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach(c => c.postMessage({ type: 'CALL_ACTION', action: 'decline', callDocId: data.callDocId }));
    })());
    return;
  }

  if (action === 'reply') {
    const replyText = (event.reply || '').trim();
    event.waitUntil((async () => {
      if (replyText && data.recipientId && data.senderId && data.clusterId) {
        try {
          await fetch('/api/messages/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ senderId: data.recipientId, receiverId: data.senderId, clusterId: data.clusterId, text: replyText }), keepalive: true });
          await fetch('/api/messages/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientId: data.recipientId, senderId: data.senderId, clusterId: data.clusterId }), keepalive: true });
        } catch {}
      }
      try { if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge(); } catch {}
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach(c => c.postMessage({ type: 'QUICK_REPLY_SENT', clusterId: data.clusterId, senderId: data.senderId, text: replyText }));
    })());
    return;
  }

  if (action === 'mark-read') {
    event.waitUntil((async () => {
      try { await fetch('/api/messages/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientId: data.recipientId, senderId: data.senderId, clusterId: data.clusterId }), keepalive: true }); } catch {}
      try { if (self.navigator.clearAppBadge) await self.navigator.clearAppBadge(); } catch {}
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      clients.forEach(c => c.postMessage({ type: 'MESSAGES_MARKED_READ', senderId: data.senderId, clusterId: data.clusterId }));
    })());
    return;
  }

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      try {
        const cu = new URL(client.url);
        if (cu.origin === self.location.origin && 'focus' in client) {
          client.postMessage({ type: 'NOTIFICATION_CLICK', url: targetUrl });
          await client.focus();
          if ('navigate' in client) try { await client.navigate(targetUrl); } catch {}
          return;
        }
      } catch {}
    }
    if (self.clients.openWindow) await self.clients.openWindow(targetUrl);
  })());
});

// ─── Push subscription changed ────────────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      clients.forEach(c => c.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' }));
    })
  );
});
