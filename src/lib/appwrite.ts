
import { Client, Account, Databases, Storage, ID, Query } from 'appwrite';
import * as sdk from 'node-appwrite';

/**
 * @fileOverview ViMore Appwrite Handshake (Self-Hosted Node)
 * Initializes the connection to the custom Command Core on Media Tech Liberia infrastructure.
 */

export const endpoint = 'https://mediatechliberia.online/v1';
export const project = 'vimore';
export const apiKey = 'standard_8a1cb610c756f68ae87e9d82b74e58999ff7e45f28315b96b5ed217809b6f5275f03f745de795a0caed1cbbc3b377c24eb52b868ed910a0c9c930855961da108128afcfe448163c0c9a6b91a122a5582fdc9809b1588b03f003e5e6d1b9acea8c9ba46fb9b7082433e82e4e814c2d991fd562b35fc5db77d897901f7566876d0';

// Client-side instance (for browser sessions and real-time synchronization)
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

// Collection Logic nodes (All 20 verified)
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
 * Uses node-appwrite SDK to prevent function errors.
 */
export const createAdminClient = () => {
  const adminClient = new sdk.Client()
    .setEndpoint(endpoint)
    .setProject(project)
    .setKey(apiKey);
    
  return {
    get account() { return new sdk.Account(adminClient); },
    get databases() { return new sdk.Databases(adminClient); },
    get storage() { return new sdk.Storage(adminClient); }
  };
};

export { ID, Query };

export default client;
