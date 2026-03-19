import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

/**
 * @fileOverview ViMore Appwrite Vault Configuration
 * Project ID: vimore
 * Endpoint: https://mediatechliberia.online/v1
 * Database ID: vimoreprod
 */

const client = new Client();

client
    .setEndpoint('https://mediatechliberia.online/v1')
    .setProject('vimore');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export { ID, Query };

// BUCKET HANDSHAKES
export const BUCKET_IMAGES = 'images';
export const BUCKET_REEL = 'reels';
export const BUCKET_STORIES = 'stories';
export const BUCKET_PAYMENTS = 'payments';
export const BUCKET_IDENTITY = 'identity';
export const BUCKET_MUSIC = 'music';

// DATABASE HANDSHAKES
export const APPWRITE_DATABASE_ID = 'vimoreprod';
export const PROFILES_COLLECTION_ID = 'profiles';
export const POSTS_COLLECTION_ID = 'posts';
export const COMMENTS_COLLECTION_ID = 'comments';
export const CONNECTIONS_COLLECTION_ID = 'connections';
export const NOTIFICATIONS_COLLECTION_ID = 'notifications';
export const MUSIC_COLLECTION_ID = 'music';
export const ALBUMS_COLLECTION_ID = 'albums';
export const PLAYLISTS_COLLECTION_ID = 'playlists';
export const STORIES_COLLECTION_ID = 'stories';
export const MESSAGES_COLLECTION_ID = 'messages';
export const CAMPAIGNS_COLLECTION_ID = 'campaigns';
export const AUDIT_LOGS_COLLECTION_ID = 'audit_logs';
export const PAYMENT_REQUESTS_COLLECTION_ID = 'payment_requests';
export const WITHDRAWALS_COLLECTION_ID = 'withdrawals';
export const CALLS_COLLECTION_ID = 'calls';

export default client;