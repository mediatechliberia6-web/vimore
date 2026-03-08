import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

/**
 * @fileOverview ViMore Appwrite Handshake (Hardcoded Nodes)
 * Initializes the connection to the custom Command Core.
 */

export const endpoint = 'http://46.225.183.141/v1';
export const project = '69ac515c000f2db8defe';
export const apiKey = 'standard_96f5c02036bc047aca5223ca6f5fed1e224aa458e8fdda3af97e1fef43078e715e11deea723dd31126aaf5d6899f72ab9f60da84788b74b8eee72eddfd8d3a69649f723c06f140bb70e3dd0b42d77ad4138e28856111d65eac8863fc6a8547da9aab61e4f5a097f6e86d8d1823bf6e3e154386f2dd65be54fcd9120b6fcdb2fc';

// Client-side instance (for sessions and real-time)
const client = new Client()
    .setEndpoint(endpoint)
    .setProject(project);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// High-Velocity IDs for Self-Hosted Instance
export const APPWRITE_DATABASE_ID = 'vimoreprod';
export const APPWRITE_BUCKET_ID = 'storgeprod'; 

// Collection Logic
export const POSTS_COLLECTION_ID = 'posts';
export const LIKES_COLLECTION_ID = 'likes';
export const UNLIKES_COLLECTION_ID = 'unlikes';
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
export const VERIFICATION_CODES_COLLECTION_ID = 'verification_codes';
export const NOTIFICATIONS_COLLECTION_ID = 'notifications';
export const CAMPAIGNS_COLLECTION_ID = 'campaigns';
export const REPORTS_COLLECTION_ID = 'reports';
export const TICKETS_COLLECTION_ID = 'tickets';
export const PLATFORM_SETTINGS_COLLECTION_ID = 'platform_settings';

/**
 * Materializes an Administrative Client for Server-Side Handshakes.
 * Bypasses CORS and Mixed Content restrictions.
 */
export const createAdminClient = () => {
  const adminClient = new Client()
    .setEndpoint(endpoint)
    .setProject(project)
    .setKey(apiKey);
    
  return {
    get account() { return new Account(adminClient); },
    get databases() { return new Databases(adminClient); },
    get storage() { return new Storage(adminClient); }
  };
};

export { ID, Query };

export default client;
