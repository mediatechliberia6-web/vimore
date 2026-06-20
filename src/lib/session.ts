import 'server-only';
import { Client, Account } from 'node-appwrite';
import { getAdminDatabases, DATABASE_ID } from './appwrite-server';
import type { NextRequest } from 'next/server';

const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://mediatechliberia.online/v1';
const PROJECT_ID =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';

export interface SessionUser {
  userId: string;
  role: string | null;
}

function extractSession(req: NextRequest): string | null {
  return (
    req.cookies.get(`a_session_${PROJECT_ID}`)?.value ||
    req.cookies.get(`a_session_${PROJECT_ID}_legacy`)?.value ||
    null
  );
}

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  try {
    const sessionValue = extractSession(req);
    if (!sessionValue) return null;

    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setSession(sessionValue);

    const account = new Account(client);
    const appwriteUser = await account.get();

    const db = getAdminDatabases();
    let role: string | null = null;
    try {
      const userDoc = await db.getDocument(DATABASE_ID, 'users', appwriteUser.$id);
      role = userDoc?.role ?? null;
    } catch {
      /* user doc not found — treat as no role */
    }

    return { userId: appwriteUser.$id, role };
  } catch {
    return null;
  }
}
