
import { Client, Account, Databases, Storage, ID } from 'appwrite';

/**
 * @fileOverview ViMore Appwrite Handshake
 * Initializes the connection to the live Appwrite backend node.
 */

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore');

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export { ID };

export default client;
