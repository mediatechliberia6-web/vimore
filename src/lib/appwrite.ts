import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

export type { Models } from 'appwrite';

const ENDPOINT = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '').replace(/\/$/, '');
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'vimoreprod';

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
  ADMIN_NOTIFICATIONS: 'admin_notifications',
  USER_BANS: 'user_bans',
  EVENTS: 'events',
  TICKETS: 'tickets',
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
  EVENT_FLYERS: 'event_flyers',
} as const;

export const BUCKET_IMAGES = BUCKET.POST_MEDIA;
export const BUCKET_STORIES = BUCKET.STORY_MEDIA;
export const BUCKET_REEL = BUCKET.REEL_MEDIA;
export const BUCKET_MUSIC = BUCKET.MUSIC_TRACKS;

export const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID, Query };

export function getFileUrl(bucketId: string, fileId: string): string {
  if (!fileId) return '';
  return `${ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${PROJECT_ID}`;
}

export function getDirectFileUrl(bucketId: string, fileId: string): string {
  if (!fileId) return '';
  return `${ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${PROJECT_ID}`;
}

export function extractFileId(url: string): string | null {
  if (!url) return null;
  const proxyMatch = url.match(/^\/api\/file\/[^/]+\/([^/?]+)/);
  if (proxyMatch) return proxyMatch[1];
  const match = url.match(/\/files\/([^\/\?]+)/);
  if (match) return match[1];
  return null;
}

export function toProxyUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('/api/file/')) {
    const match = url.match(/^\/api\/file\/([^/]+)\/([^/?]+)/);
    if (match) return getFileUrl(match[1], match[2]);
  }
  return url;
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

export async function getSecurityQuestion(vimoreId: string): Promise<string | null> {
  try {
    const normalised = vimoreId.includes('@') ? vimoreId : `${vimoreId}@vimore.cfd`;
    const result = await databases.listDocuments(DATABASE_ID, COL.USERS, [
      Query.equal('email', normalised),
      Query.limit(1),
    ]);
    if (result.documents.length === 0) return null;
    return result.documents[0].security_question || null;
  } catch {
    return null;
  }
}

export async function verifySecurityAnswer(vimoreId: string, answer: string): Promise<boolean> {
  try {
    const normalised = vimoreId.includes('@') ? vimoreId : `${vimoreId}@vimore.cfd`;
    const result = await databases.listDocuments(DATABASE_ID, COL.USERS, [
      Query.equal('email', normalised),
      Query.limit(1),
    ]);
    if (result.documents.length === 0) return false;
    const stored = (result.documents[0].security_answer || '').toLowerCase().trim();
    return stored === answer.toLowerCase().trim();
  } catch {
    return false;
  }
}
