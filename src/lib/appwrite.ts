import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

/**
 * @fileOverview ViMore Appwrite Handshake
 * Initializes the connection to the live Appwrite backend node.
 * 
 * Vault Info:
 * - Bucket: vimore_storge (ID: all_media)
 * - Database: vimore_prod (ID: 69a2cffd00320dcd64bc)
 */

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore';

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(project);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const APPWRITE_DATABASE_ID = '69a2cffd00320dcd64bc';
export const APPWRITE_BUCKET_ID = 'all_media'; 
export const POSTS_COLLECTION_ID = 'posts';
export const LIKES_COLLECTION_ID = 'likes';
export const COMMENTS_COLLECTION_ID = 'comments';
export const FOLLOWS_COLLECTION_ID = 'follows';
export const MESSAGES_COLLECTION_ID = 'messages';
export const CLUSTERS_COLLECTION_ID = 'clusters';
export const PROFILES_COLLECTION_ID = 'profiles';
export const WITHDRAWALS_COLLECTION_ID = 'withdrawals';
export const PAYMENTS_COLLECTION_ID = 'payments';
export const AUDIT_LOGS_COLLECTION_ID = 'audit_logs';
export const STORIES_COLLECTION_ID = 'stories';
export const CALLS_COLLECTION_ID = 'calls';
export const SONGS_COLLECTION_ID = 'songs';
export const ALBUMS_COLLECTION_ID = 'albums';
export const PLAYLISTS_COLLECTION_ID = 'playlists';
export const VERIFICATION_NODES_COLLECTION_ID = 'verification_nodes';
export const NOTIFICATIONS_COLLECTION_ID = 'notifications';
export const CAMPAIGNS_COLLECTION_ID = 'campaigns';
export const REPORTS_COLLECTION_ID = 'reports';
export const TICKETS_COLLECTION_ID = 'tickets';

export { ID, Query };

export default client;
