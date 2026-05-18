const KEYS = {
  USER:        'vm_offline_user',
  POSTS:       'vm_offline_posts',
  CONNECTIONS: 'vm_offline_connections',
  SONGS:       'vm_offline_songs',
  ALBUMS:      'vm_offline_albums',
};

function save(key: string, data: unknown) {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { }
}

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
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

/** Save up to maxItems items to localStorage. */
export function saveCache<T>(key: string, items: T[], maxItems = 15): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(items.slice(0, maxItems)));
  } catch {}
}

/** Load items saved with saveCache. Returns [] on any failure. */
export function loadCache<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
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
