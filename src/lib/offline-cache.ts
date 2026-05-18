const CACHE_MAX_AGE_MS = 5 * 60 * 60 * 1000; // 5 hours

const KEYS = {
  USER:        'vm_offline_user',
  POSTS:       'vm_offline_posts',
  CONNECTIONS: 'vm_offline_connections',
  SONGS:       'vm_offline_songs',
  ALBUMS:      'vm_offline_albums',
};

interface TimestampedEntry<T> {
  data: T;
  savedAt: number;
}

function save(key: string, data: unknown) {
  try {
    const entry: TimestampedEntry<unknown> = { data, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch { }
}

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (!v) return fallback;
    const parsed = JSON.parse(v);
    // Support both old plain format and new timestamped format
    if (parsed && typeof parsed === 'object' && 'savedAt' in parsed && 'data' in parsed) {
      const entry = parsed as TimestampedEntry<T>;
      if (Date.now() - entry.savedAt > CACHE_MAX_AGE_MS) {
        localStorage.removeItem(key);
        return fallback;
      }
      return entry.data;
    }
    // Legacy plain value — return as-is
    return parsed as T;
  } catch { return fallback; }
}

export const offlineCache = {
  saveUser:        (user: unknown)        => save(KEYS.USER, user),
  getUser:         ()                     => load<unknown | null>(KEYS.USER, null),
  clearUser:       ()                     => { try { localStorage.removeItem(KEYS.USER); } catch { } },

  savePosts:       (posts: unknown[])     => save(KEYS.POSTS, posts),
  getPosts:        ()                     => load<unknown[]>(KEYS.POSTS, []),

  saveConnections: (conns: unknown[])     => save(KEYS.CONNECTIONS, conns),
  getConnections:  ()                     => load<unknown[]>(KEYS.CONNECTIONS, []),

  saveSongs:       (songs: unknown[])     => save(KEYS.SONGS, songs),
  getSongs:        ()                     => load<unknown[]>(KEYS.SONGS, []),

  saveAlbums:      (albums: unknown[])    => save(KEYS.ALBUMS, albums),
  getAlbums:       ()                     => load<unknown[]>(KEYS.ALBUMS, []),
};

// ─── Extended cache helpers ────────────────────────────────────────────────────

export const OFFLINE_KEYS = {
  REELS:             'vimore_reels_cache_v1',
  MUSIC_PLAYED:      'vimore_music_played_v1',
  FRIENDS:           'vimore_friends_cache_v1',
  MESSAGES_CONTACTS: 'vimore_messages_contacts_v1',
  HOME_FEED:         'vimore_feed_cache_v1',
};

/** Save up to maxItems items to localStorage with a timestamp. */
export function saveCache<T>(key: string, items: T[], maxItems = 15): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: TimestampedEntry<T[]> = { data: items.slice(0, maxItems), savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {}
}

/** Load items saved with saveCache. Returns [] on any failure or expiry. */
export function loadCache<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && 'savedAt' in parsed && 'data' in parsed) {
      const entry = parsed as TimestampedEntry<T[]>;
      if (Date.now() - entry.savedAt > CACHE_MAX_AGE_MS) {
        localStorage.removeItem(key);
        return [];
      }
      return Array.isArray(entry.data) ? entry.data : [];
    }
    // Legacy plain array format
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

/**
 * Clears every known offline/feed cache from localStorage AND tells the
 * service worker to delete all its caches too.
 */
export function clearAllLocalCaches(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') { resolve(); return; }

    // 1. Purge all known localStorage keys
    const allKeys = [
      ...Object.values(KEYS),
      ...Object.values(OFFLINE_KEYS),
      // well-known extra keys used elsewhere in the app
      'vimore_marketplace_dir_v1',
      'vimore_product_grid_v1',
      'vimore_search_history',
      'vimore_drafts',
    ];
    for (const k of allKeys) {
      try { localStorage.removeItem(k); } catch {}
    }

    // 2. Also delete the IndexedDB document cache
    try {
      indexedDB.deleteDatabase('vimore-db-cache');
    } catch {}

    // 3. Tell the service worker to wipe its caches
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then(reg => {
          if (reg.active) {
            const channel = new MessageChannel();
            channel.port1.onmessage = () => resolve();
            reg.active.postMessage({ type: 'CLEAR_ALL_CACHE' }, [channel.port2]);
            // Resolve after 2 s even if no reply
            setTimeout(resolve, 2000);
          } else {
            resolve();
          }
        })
        .catch(() => resolve());
    } else {
      resolve();
    }
  });
}

/**
 * Tell the service worker to pre-fetch and store these URLs in the
 * long-lived (24 h) pinned media cache for offline use.
 */
export function pinMediaInSW(urls: string[]): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  const valid = urls.filter(u => Boolean(u) && (u.startsWith('http') || u.startsWith('/')));
  if (!valid.length) return;
  navigator.serviceWorker.ready
    .then(reg => { reg.active?.postMessage({ type: 'PIN_MEDIA', urls: valid }); })
    .catch(() => {});
}

/**
 * Ask the service worker to pre-cache the given routes for offline navigation.
 */
export function precacheRoutes(routes: string[]): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then(reg => { reg.active?.postMessage({ type: 'PRECACHE_ROUTES', routes }); })
    .catch(() => {});
}
