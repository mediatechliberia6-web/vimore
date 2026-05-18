/**
 * ViMore Service Worker v10
 * - PINNED_MEDIA_CACHE: 24 h — audio/video intentionally played by the user
 * - MEDIA_CACHE: 2 h  — all other images / media encountered while browsing
 * - Everything else (HTML, CSS, JS, API) always fetched fresh from the network
 * - Push notifications and badge control unchanged
 */

const SW_VERSION = 'v10';
const MEDIA_CACHE  = `vimore-media-${SW_VERSION}`;
const PINNED_CACHE = `vimore-pinned-${SW_VERSION}`;
const CACHE_NAMES  = [MEDIA_CACHE, PINNED_CACHE];

const MAX_MEDIA_AGE_MS  = 2  * 60 * 60 * 1000;  // 2 h
const MAX_PINNED_AGE_MS = 24 * 60 * 60 * 1000;  // 24 h

const MEDIA_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg',
  '.mp4', '.webm', '.ogv',
  '.mp3', '.ogg', '.wav', '.aac', '.m4a', '.flac', '.opus',
];

const APPWRITE_FILE_PATTERNS = ['/v1/storage/buckets/', '/files/'];

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
  const cache = await caches.open(cacheName);
  const keys  = await cache.keys();
  await Promise.all(
    keys.map(async req => {
      const res = await cache.match(req);
      if (res && isExpired(res, maxAge)) await cache.delete(req);
    })
  );
}

// ─── Install ───────────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(keys.filter(k => !CACHE_NAMES.includes(k)).map(k => caches.delete(k)))
      )
      .then(() => Promise.all([
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

  if (!isMediaUrl(request.url)) return;

  event.respondWith(
    (async () => {
      // 1. Check pinned (24 h) cache first
      const pinnedCache = await caches.open(PINNED_CACHE);
      const pinned = await pinnedCache.match(request);
      if (pinned && !isExpired(pinned, MAX_PINNED_AGE_MS)) return pinned;
      if (pinned) pinnedCache.delete(request);

      // 2. Check regular (2 h) media cache
      const mediaCache = await caches.open(MEDIA_CACHE);
      const cached = await mediaCache.match(request);
      if (cached && !isExpired(cached, MAX_MEDIA_AGE_MS)) return cached;
      if (cached) mediaCache.delete(request);

      // 3. Fetch from network
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

  // Client asks us to pre-cache specific URLs in the pinned (24 h) store
  if (data.type === 'PIN_MEDIA' && Array.isArray(data.urls)) {
    event.waitUntil(
      caches.open(PINNED_CACHE).then(async cache => {
        for (const url of data.urls) {
          try {
            const existing = await cache.match(url);
            if (existing && !isExpired(existing, MAX_PINNED_AGE_MS)) continue;
            const response = await fetch(url, { mode: 'no-cors' });
            // no-cors gives an opaque response; cache it anyway for offline use
            if (response.status === 0 || response.ok) {
              await cache.put(url, stampResponse(response));
            }
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
  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (data.type === 'SET_BADGE') {
    const count = Number(data.count) || 0;
    try {
      if (count > 0 && self.navigator.setAppBadge)       self.navigator.setAppBadge(count).catch(() => {});
      else if (self.navigator.clearAppBadge)              self.navigator.clearAppBadge().catch(() => {});
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
