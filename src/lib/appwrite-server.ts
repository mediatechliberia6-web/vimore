import { Client, Databases, Users } from 'node-appwrite';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;

export const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'vimoreprod';
export const VERIFICATIONS_COLLECTION_ID = 'verifications';

function getAdminClient(): Client {
  const client = new Client();
  client.setEndpoint(ENDPOINT).setProject(PROJECT_ID).setKey(API_KEY);
  return client;
}

export function getAdminDatabases(): Databases {
  return new Databases(getAdminClient());
}

export function getAdminUsers(): Users {
  return new Users(getAdminClient());
}
