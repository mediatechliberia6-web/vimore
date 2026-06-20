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

function extractJwt(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

function extractCookieSession(req: NextRequest): string | null {
  return (
    req.cookies.get(`a_session_${PROJECT_ID}`)?.value ||
    req.cookies.get(`a_session_${PROJECT_ID}_legacy`)?.value ||
    null
  );
}

async function resolveUser(client: Client): Promise<SessionUser | null> {
  try {
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

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  // 1. JWT from Authorization header — primary path for browser clients.
  //    The Appwrite web SDK stores sessions in localStorage (not cookies) in browser
  //    environments, so req.cookies is empty. The client bridges this by calling
  //    account.createJWT() and passing it as "Authorization: Bearer <jwt>".
  //    See src/lib/auth-fetch.ts.
  const jwt = extractJwt(req);
  if (jwt) {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setJWT(jwt);
    const user = await resolveUser(client);
    if (user) return user;
  }

  // 2. Fall back to cookie-based session (SSR / some deployment setups).
  const sessionValue = extractCookieSession(req);
  if (sessionValue) {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setSession(sessionValue);
    const user = await resolveUser(client);
    if (user) return user;
  }

  return null;
}
