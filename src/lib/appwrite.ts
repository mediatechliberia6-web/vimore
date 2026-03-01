
import { Client, Account, Databases, Storage, ID } from 'appwrite';

/**
 * @fileOverview ViMore Appwrite Handshake
 * Initializes the connection to the live Appwrite backend node.
 * 
 * Vault Info:
 * - Bucket: vimore_storge (ID: all_media)
 * - Database: vimore_prod (ID: 69a2cffd00320dcd64bc)
 */

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

export const APPWRITE_DATABASE_ID = '69a2cffd00320dcd64bc';
export const APPWRITE_BUCKET_ID = 'all_media'; 
export const POSTS_COLLECTION_ID = 'posts';
export const LIKES_COLLECTION_ID = 'likes';
export const COMMENTS_COLLECTION_ID = 'comments';
export const FOLLOWS_COLLECTION_ID = 'follows';

export { ID };

export default client;
