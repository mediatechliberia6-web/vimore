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
