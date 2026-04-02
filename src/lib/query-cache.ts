/**
 * ViMore Query Cache
 *
 * Caches Appwrite document query results in-memory (current session)
 * AND in localStorage (persists across page reloads / revisits).
 *
 * Strategy: Cache-First for reads — data is always served from local cache.
 * Appwrite is only contacted on the very first fetch per item.
 *
 * TTLs (per collection type):
 *   posts / media → 30 days  (permanent for bandwidth saving)
 *   music         → 30 days
 *   users         → 30 days
 *   messages      → 7  days
 *   default       → 30 days
 */

const LS_PREFIX = 'vimore_qcache_';

const DAY = 24 * 60 * 60 * 1000;

const TTL_MAP: Record<string, number> = {
  posts:        30 * DAY,
  tracks:       30 * DAY,
  albums:       30 * DAY,
  playlists:    30 * DAY,
  users:        30 * DAY,
  stories:      30 * DAY,
  follows:      30 * DAY,
  messages:     7  * DAY,
};
const DEFAULT_TTL = 30 * DAY;

interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttl: number;
}

// In-memory store (cleared on full page reload)
const memoryStore = new Map<string, CacheEntry<unknown>>();

function ttlFor(collection: string): number {
  const key = Object.keys(TTL_MAP).find(k => collection.toLowerCase().includes(k));
  return key ? TTL_MAP[key] : DEFAULT_TTL;
}

function buildKey(collection: string, queries: unknown[]): string {
  return `${collection}::${JSON.stringify(queries)}`;
}

function isExpired(entry: CacheEntry<unknown>): boolean {
  return Date.now() - entry.cachedAt > entry.ttl;
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function lsGet<T>(key: string): CacheEntry<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LS_PREFIX + key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (isExpired(entry)) {
      localStorage.removeItem(LS_PREFIX + key);
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function lsSet<T>(key: string, entry: CacheEntry<T>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full — remove oldest vimore cache entries and retry once
    pruneLocalStorage();
    try {
      localStorage.setItem(LS_PREFIX + key, JSON.stringify(entry));
    } catch { /* ignore */ }
  }
}

function pruneLocalStorage(): void {
  if (typeof window === 'undefined') return;
  const keys = Object.keys(localStorage).filter(k => k.startsWith(LS_PREFIX));
  // Remove expired entries first
  for (const k of keys) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const entry = JSON.parse(raw) as CacheEntry<unknown>;
      if (isExpired(entry)) localStorage.removeItem(k);
    } catch {
      localStorage.removeItem(k);
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Read from cache. Returns null if no valid cached value exists.
 */
export function cacheGet<T>(collection: string, queries: unknown[]): T | null {
  const key = buildKey(collection, queries);

  // 1. Memory first
  const mem = memoryStore.get(key);
  if (mem && !isExpired(mem)) return mem.data as T;

  // 2. localStorage
  const ls = lsGet<T>(key);
  if (ls) {
    // Re-hydrate memory store
    memoryStore.set(key, ls);
    return ls.data;
  }

  return null;
}

/**
 * Write to both cache layers.
 */
export function cacheSet<T>(collection: string, queries: unknown[], data: T): void {
  const key   = buildKey(collection, queries);
  const ttl   = ttlFor(collection);
  const entry: CacheEntry<T> = { data, cachedAt: Date.now(), ttl };

  memoryStore.set(key, entry as CacheEntry<unknown>);
  lsSet(key, entry);
}

/**
 * Invalidate cache entries that match a collection prefix.
 * Call this after a write/mutation so stale data is not served.
 */
export function cacheInvalidate(collection: string): void {
  // Clear memory
  for (const key of memoryStore.keys()) {
    if (key.startsWith(collection)) memoryStore.delete(key);
  }
  // Clear localStorage
  if (typeof window === 'undefined') return;
  const prefix = LS_PREFIX + collection;
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith(prefix)) localStorage.removeItem(k);
  }
}

/**
 * Wrap an async fetcher with cache-first logic.
 * If a cached value exists it is returned immediately.
 * The fetcher is called and its result cached when there is a cache miss.
 *
 * @example
 * const docs = await withCache('posts', [Query.equal('author_id', uid)], () =>
 *   databases.listDocuments(DB, COL.POSTS, [Query.equal('author_id', uid)])
 * );
 */
export async function withCache<T>(
  collection: string,
  queries: unknown[],
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = cacheGet<T>(collection, queries);
  if (cached !== null) return cached;

  const result = await fetcher();
  cacheSet(collection, queries, result);
  return result;
}

/**
 * Clear ALL ViMore cache entries (both memory and localStorage).
 * Useful for sign-out or a forced refresh.
 */
export function clearAllCache(): void {
  memoryStore.clear();
  if (typeof window === 'undefined') return;
  for (const k of Object.keys(localStorage)) {
    if (k.startsWith(LS_PREFIX)) localStorage.removeItem(k);
  }
}
