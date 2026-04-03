import 'server-only';
import { Client, Databases, Users } from 'node-appwrite';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY = process.env.APPWRITE_API_KEY!;

export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'vimoreprod';

function createAdminClient(): Client {
  return new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);
}

export function getAdminDatabases(): Databases {
  return new Databases(createAdminClient());
}

export function getAdminUsers(): Users {
  return new Users(createAdminClient());
}
