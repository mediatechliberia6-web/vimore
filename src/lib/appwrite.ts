/**
 * MOCK DATA SERVICE — Prototype Mode
 * All Appwrite SDK calls replaced with in-memory mock data.
 * No Appwrite connection required.
 */

export type { Models } from 'appwrite';

export const DATABASE_ID = 'vimoreprod';

export const COL = {
  USERS: 'users',
  POSTS: 'posts',
  POST_COMMENTS: 'post_comments',
  POST_REACTIONS: 'post_reactions',
  POST_UNLOCKS: 'post_unlocks',
  BOOKMARKS: 'bookmarks',
  STORIES: 'stories',
  STORY_SEGMENTS: 'story_segments',
  STORY_VIEWS: 'story_views',
  FOLLOWS: 'follows',
  FRIEND_REQUESTS: 'friend_requests',
  BLOCKED_USERS: 'blocked_users',
  MESSAGES: 'messages',
  CLUSTERS: 'clusters',
  CLUSTER_MEMBERS: 'cluster_members',
  TRACKS: 'tracks',
  TRACK_LIKES: 'track_likes',
  ALBUMS: 'albums',
  PLAYLISTS: 'playlists',
  PLAYLIST_TRACKS: 'playlist_tracks',
  NOTIFICATIONS: 'notifications',
  TRANSACTIONS: 'transactions',
  WITHDRAWAL_REQUESTS: 'withdrawal_requests',
  PAYMENT_REQUESTS: 'payment_requests',
  SUBSCRIPTIONS: 'subscriptions',
  VERIFICATION_RECORDS: 'verification_records',
  REFERRALS: 'referrals',
  REPORTS: 'reports',
  SUPPORT_TICKETS: 'support_tickets',
  AD_CAMPAIGNS: 'ad_campaigns',
  AUDIT_LOGS: 'audit_logs',
  CALL_LOGS: 'call_logs',
} as const;

export const BUCKET = {
  AVATARS: 'avatars',
  COVERS: 'covers',
  POST_MEDIA: 'post_media',
  STORY_MEDIA: 'story_media',
  REEL_MEDIA: 'reel_media',
  MUSIC_TRACKS: 'music_tracks',
  ALBUM_COVERS: 'album_covers',
  VOICE_MESSAGES: 'voice_messages',
  PAYMENT_SCREENSHOTS: 'payment_screenshots',
  MESSAGE_MEDIA: 'message_media',
} as const;

export const BUCKET_IMAGES = BUCKET.POST_MEDIA;
export const BUCKET_STORIES = BUCKET.STORY_MEDIA;
export const BUCKET_REEL = BUCKET.REEL_MEDIA;
export const BUCKET_MUSIC = BUCKET.MUSIC_TRACKS;

const now = new Date().toISOString();
const d = (hoursAgo: number) => new Date(Date.now() - hoursAgo * 3600000).toISOString();

const _uploadedFiles: Record<string, string> = {};

const _collections: Record<string, Record<string, any>> = {
  users: {
    user_001: {
      $id: 'user_001', $createdAt: d(2160), $updatedAt: d(2),
      name: 'Alex Johnson', username: 'alex.johnson', email: 'alex.johnson@vimore.cfd',
      bio: 'Building the future, one post at a time. Digital creator & music lover 🎵✨',
      category: 'Creator', gender: 'Male', nationality: 'Liberian',
      date_of_birth: '1998-04-12',
      avatar_id: null, cover_id: null,
      is_verified: true, has_ever_been_verified: true,
      followers_count: 0, following_count: 0, friends_count: 0, posts_count: 0,
      gold_balance: 500, diamond_balance: 25, star_balance: 10,
      referral_code: 'VMALEXJO4X9', referral_count: 0,
      role: 'SUPER', join_date: d(2160), language: 'en',
      security_question: "What was the name of your first pet?",
      security_answer: 'buddy',
    },
  },

  posts: {},
  post_comments: {},
  post_reactions: {},
  post_unlocks: {},
  bookmarks: {},

  stories: {},
  story_segments: {},
  story_views: {},

  follows: {},
  friend_requests: {},
  blocked_users: {},

  messages: {},
  clusters: {},
  cluster_members: {},

  tracks: {},
  track_likes: {},
  albums: {},
  playlists: {},
  playlist_tracks: {},

  notifications: {},
  transactions: {},
  withdrawal_requests: {},
  payment_requests: {},
  subscriptions: {},
  verification_records: {},
  referrals: {},
  reports: {},
  support_tickets: {},
  ad_campaigns: {},

  audit_logs: {
    log_001: {
      $id: 'log_001', $createdAt: d(0),
      action: 'SYSTEM_INIT', details: 'ViMore platform initialized.',
      performed_by: 'system', performed_by_avatar: '',
    },
  },

  call_logs: {},
};

let _sessionUserId: string | null = 'user_001';

export const ID = {
  unique: (): string => 'mock_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
};

type MockQuery =
  | { type: 'equal'; key: string; value: any }
  | { type: 'notEqual'; key: string; value: any }
  | { type: 'greaterThan'; key: string; value: any }
  | { type: 'lessThan'; key: string; value: any }
  | { type: 'orderDesc'; key: string }
  | { type: 'orderAsc'; key: string }
  | { type: 'limit'; value: number }
  | { type: 'offset'; value: number };

export const Query = {
  equal: (key: string, value: any): MockQuery => ({ type: 'equal', key, value }),
  notEqual: (key: string, value: any): MockQuery => ({ type: 'notEqual', key, value }),
  greaterThan: (key: string, value: any): MockQuery => ({ type: 'greaterThan', key, value }),
  lessThan: (key: string, value: any): MockQuery => ({ type: 'lessThan', key, value }),
  orderDesc: (key: string): MockQuery => ({ type: 'orderDesc', key }),
  orderAsc: (key: string): MockQuery => ({ type: 'orderAsc', key }),
  limit: (n: number): MockQuery => ({ type: 'limit', value: n }),
  offset: (n: number): MockQuery => ({ type: 'offset', value: n }),
  isNull: (key: string): MockQuery => ({ type: 'equal', key, value: null }),
  isNotNull: (key: string): MockQuery => ({ type: 'notEqual', key, value: null }),
  contains: (key: string, value: any): MockQuery => ({ type: 'equal', key, value }),
};

function applyQueries(docs: any[], queries: any[]): { documents: any[]; total: number } {
  let result = [...docs];
  let limitVal = 1000;
  let orderField: string | null = null;
  let orderDir: 'asc' | 'desc' = 'desc';

  for (const q of queries) {
    if (!q || typeof q !== 'object') continue;
    if (q.type === 'equal') {
      if (Array.isArray(q.value)) {
        result = result.filter(doc => q.value.includes(doc[q.key]));
      } else {
        result = result.filter(doc => doc[q.key] === q.value);
      }
    } else if (q.type === 'notEqual') {
      result = result.filter(doc => doc[q.key] !== q.value);
    } else if (q.type === 'greaterThan') {
      result = result.filter(doc => (doc[q.key] || '') > q.value);
    } else if (q.type === 'lessThan') {
      result = result.filter(doc => (doc[q.key] || '') < q.value);
    } else if (q.type === 'orderDesc') {
      orderField = q.key;
      orderDir = 'desc';
    } else if (q.type === 'orderAsc') {
      orderField = q.key;
      orderDir = 'asc';
    } else if (q.type === 'limit') {
      limitVal = q.value;
    }
  }

  if (orderField) {
    const field = orderField;
    const dir = orderDir;
    result.sort((a, b) => {
      const aVal = a[field] ?? '';
      const bVal = b[field] ?? '';
      if (dir === 'desc') return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    });
  }

  const total = result.length;
  result = result.slice(0, limitVal);
  return { documents: result, total };
}

function getCol(col: string): Record<string, any> {
  if (!_collections[col]) _collections[col] = {};
  return _collections[col];
}

export const account = {
  async get(): Promise<any> {
    if (!_sessionUserId) throw new Error('[Mock] No active session');
    const userDoc = _collections.users[_sessionUserId];
    if (!userDoc) throw new Error('[Mock] User not found');
    return {
      $id: _sessionUserId,
      name: userDoc.name,
      email: userDoc.email,
      emailVerification: true,
      $createdAt: userDoc.join_date || now,
      $updatedAt: userDoc.$updatedAt || now,
    };
  },

  async create(_id: string, vimoreId: string, _password: string, name: string): Promise<any> {
    const newId = ID.unique();
    const parts = name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim().split(/\s+/);
    const username = parts.length >= 2 ? `${parts[0]}.${parts[parts.length - 1]}` : parts[0] || 'user';

    // First account to sign up automatically becomes SUPER admin
    const existingUserCount = Object.keys(_collections.users).length;
    const isFirstUser = existingUserCount === 0;

    const newUser = {
      $id: newId, $createdAt: now, $updatedAt: now,
      name, username, email: vimoreId, bio: '', category: '', gender: '',
      nationality: '', date_of_birth: '', avatar_id: null, cover_id: null,
      is_verified: false, has_ever_been_verified: false,
      followers_count: 0, following_count: 0, friends_count: 0, posts_count: 0,
      gold_balance: 100, diamond_balance: 5, star_balance: 2,
      referral_code: 'VM' + username.toUpperCase().slice(0, 6) + Math.random().toString(36).slice(2, 5).toUpperCase(),
      referral_count: 0,
      role: isFirstUser ? 'SUPER' : 'USER',
      join_date: now, language: 'en',
      security_question: '', security_answer: '',
    };
    _collections.users[newId] = newUser;
    _sessionUserId = newId;
    return { $id: newId, name, email: vimoreId, emailVerification: false, $createdAt: now };
  },

  async createEmailPasswordSession(vimoreId: string, _password: string): Promise<void> {
    const normalised = vimoreId.includes('@') ? vimoreId : `${vimoreId}@vimore.cfd`;
    const entry = Object.entries(_collections.users).find(([_, u]) => u.email === normalised);
    if (!entry) throw new Error('[Mock] No account found. Try: alex.johnson@vimore.cfd');
    _sessionUserId = entry[0];
  },

  async deleteSession(_type: string): Promise<void> {
    _sessionUserId = null;
  },

  async createVerification(_url: string): Promise<any> {
    return { $id: ID.unique(), userId: _sessionUserId, secret: ID.unique() };
  },

  async updateVerification(_userId: string, _secret: string): Promise<any> {
    if (_sessionUserId && _collections.users[_sessionUserId]) {
      _collections.users[_sessionUserId].email_verified = true;
    }
    return { $id: ID.unique() };
  },

  async updateRecovery(_userId: string, _secret: string, _password: string): Promise<any> {
    return { $id: ID.unique() };
  },

  async createRecovery(_email: string, _url: string): Promise<any> {
    return { $id: ID.unique() };
  },
};

export const databases = {
  async getDocument(_db: string, col: string, id: string): Promise<any> {
    const doc = getCol(col)[id];
    if (!doc) throw new Error(`[Mock] Document '${id}' not found in '${col}'`);
    return { ...doc };
  },

  async listDocuments(_db: string, col: string, queries: any[] = []): Promise<any> {
    const docs = Object.values(getCol(col));
    return applyQueries(docs, queries);
  },

  async createDocument(_db: string, col: string, id: string, data: any): Promise<any> {
    const docId = (id === 'unique()' || !id) ? ID.unique() : id;
    const doc = {
      ...data,
      $id: docId,
      $createdAt: new Date().toISOString(),
      $updatedAt: new Date().toISOString(),
    };
    getCol(col)[docId] = doc;
    return { ...doc };
  },

  async updateDocument(_db: string, col: string, id: string, data: any): Promise<any> {
    const existing = getCol(col)[id];
    if (!existing) throw new Error(`[Mock] Document '${id}' not found in '${col}'`);
    const updated = { ...existing, ...data, $updatedAt: new Date().toISOString() };
    getCol(col)[id] = updated;
    return { ...updated };
  },

  async deleteDocument(_db: string, col: string, id: string): Promise<void> {
    delete getCol(col)[id];
  },
};

export const storage = {
  async createFile(_bucket: string, _id: string, file: File): Promise<any> {
    const mockId = 'file_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    try {
      const url = URL.createObjectURL(file);
      _uploadedFiles[mockId] = url;
    } catch { /* ignore in SSR */ }
    return { $id: mockId };
  },
};

export function getFileUrl(_bucketId: string, fileId: string): string {
  if (!fileId) return '';
  if (_uploadedFiles[fileId]) return _uploadedFiles[fileId];
  return '';
}

export function extractFileId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/\/files\/([^\/\?]+)/);
  if (match) return match[1];
  const seedMatch = url.match(/seed\/([^\/\?]+)/);
  if (seedMatch) return seedMatch[1];
  if (url.startsWith('blob:') || url.startsWith('http')) {
    const existing = Object.entries(_uploadedFiles).find(([_, v]) => v === url);
    if (existing) return existing[0];
  }
  return null;
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export function avatarFallback(_name?: string): string {
  return '';
}

export function getSecurityQuestion(vimoreId: string): string | null {
  const normalised = vimoreId.includes('@') ? vimoreId : `${vimoreId}@vimore.cfd`;
  const entry = Object.values(_collections.users).find((u: any) => u.email === normalised);
  return entry ? (entry.security_question || null) : null;
}

export function verifySecurityAnswer(vimoreId: string, answer: string): boolean {
  const normalised = vimoreId.includes('@') ? vimoreId : `${vimoreId}@vimore.cfd`;
  const entry = Object.values(_collections.users).find((u: any) => u.email === normalised);
  if (!entry) return false;
  return (entry.security_answer || '').toLowerCase().trim() === answer.toLowerCase().trim();
}
