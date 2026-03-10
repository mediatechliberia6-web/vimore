import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';

/**
 * @fileOverview ViMore Appwrite Handshake (Self-Hosted Node)
 * Initializes the connection to the custom Command Core on Media Tech Liberia infrastructure.
 */

export const endpoint = 'https://mediatechliberia.online/v1';
export const project = 'vimore';
export const apiKey = 'standard_f4e50c5273182665455c97f6a72b6c082f918c2c2afd2eaefde3576e8167419d69b36ac00ed89aeb0f706d961f0fa63e0dfbbe289582bc809eb75ba895ff5e8fab4f17142bcd0e195d00414093400db9039591d02053862e258a05c03a01fc0dfb4531ee2b44de329497ee80a5934b7dc2061e5290a999ccfe60fe58e9541034';

// Client-side instance (for sessions and real-time synchronization)
const client = new Client()
    .setEndpoint(endpoint)
    .setProject(project);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// High-Velocity Database ID
export const APPWRITE_DATABASE_ID = 'vimoreprod';

/** 
 * MULTI-BUCKET STORAGE ARCHITECTURE
 * Designated vaults for specialized network data nodes.
 */
export const BUCKET_VOICENOTE = 'voicenote'; // Chat voice messages
export const BUCKET_MUSIC = 'music'; // Songs, albums, and playlists
export const BUCKET_STORIES = 'stories_video_image'; // Temporal story nodes (2-day life)
export const BUCKET_PAYMENTS = 'payments_payout'; // Payment screenshots (3-day life)
export const BUCKET_REEL = 'reel'; // High-velocity video reels
export const BUCKET_IMAGES = 'images'; // Standard profile and post visuals

// Collection Logic nodes
export const PROFILES_COLLECTION_ID = 'profiles';
export const FOLLOWS_COLLECTION_ID = 'follows';
export const POSTS_COLLECTION_ID = 'posts';
export const LIKES_COLLECTION_ID = 'likes';
export const UNLIKES_COLLECTION_ID = 'unlikes';
export const COMMENTS_COLLECTION_ID = 'comments';
export const MESSAGES_COLLECTION_ID = 'messages';
export const CLUSTERS_COLLECTION_ID = 'clusters';
export const VERIFICATION_CODES_COLLECTION_ID = 'verification_codes';
export const WITHDRAWALS_COLLECTION_ID = 'withdrawals';
export const PAYMENTS_COLLECTION_ID = 'payments';
export const STORIES_COLLECTION_ID = 'stories';
export const NOTIFICATIONS_COLLECTION_ID = 'notifications';
export const CAMPAIGNS_COLLECTION_ID = 'campaigns';
export const REPORTS_COLLECTION_ID = 'reports';
export const TICKETS_COLLECTION_ID = 'tickets';
export const SONGS_COLLECTION_ID = 'songs';
export const ALBUMS_COLLECTION_ID = 'albums';
export const PLAYLISTS_COLLECTION_ID = 'playlists';
export const AUDIT_LOGS_COLLECTION_ID = 'audit_logs';

/**
 * Materializes an Administrative Client for Server-Side Handshakes.
 * Bypasses browser-based security blocks (Mixed Content / CORS).
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
