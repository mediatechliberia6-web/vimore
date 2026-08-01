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

// ─── credential extractors ─────────────────────────────────────────────────

/** Primary: direct session value sent by authFetch from localStorage. */
function extractSessionHeader(req: NextRequest): string | null {
  return req.headers.get('x-appwrite-session');
}

/** Secondary: Appwrite JWT sent as Authorization: Bearer <jwt>. */
function extractJwt(req: NextRequest): string | null {
  const auth = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

/** Legacy: cookie-based session (may work in some deployment setups). */
function extractCookieSession(req: NextRequest): string | null {
  return (
    req.cookies.get(`a_session_${PROJECT_ID}`)?.value ||
    req.cookies.get(`a_session_${PROJECT_ID}_legacy`)?.value ||
    null
  );
}

// ─── user resolution (with diagnostics) ───────────────────────────────────

async function resolveUserWithDiagnostics(client: Client): Promise<{ user: SessionUser | null; error?: string }> {
  try {
    const account = new Account(client);
    try {
      const appwriteUser = await account.get();
      const db = getAdminDatabases();
      let role: string | null = null;
      try {
        const userDoc = await db.getDocument(DATABASE_ID, 'users', appwriteUser.$id);
        role = userDoc?.role ?? null;
      } catch (dbErr: any) {
        // Non-fatal: we still return the user but capture DB error for diagnostics
        return { user: { userId: appwriteUser.$id, role: null }, error: `db:${String(dbErr?.message || dbErr)}` };
      }
      return { user: { userId: appwriteUser.$id, role } };
    } catch (acctErr: any) {
      // account.get() failed — no valid session for this client
      return { user: null, error: `account:${String(acctErr?.message || acctErr)}` };
    }
  } catch (err: any) {
    return { user: null, error: String(err?.message || err) };
  }
}

// ─── main export with verbose failure logging ─────────────────────────────

export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const tried: Record<string, string | undefined> = {};

  // 1. Direct session from localStorage (sent by authFetch as X-Appwrite-Session).
  const sessionHeader = extractSessionHeader(req);
  if (sessionHeader) {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setSession(sessionHeader);
    const res = await resolveUserWithDiagnostics(client);
    if (res.user) return res.user;
    tried['x-appwrite-session'] = res.error || 'no-user';
  } else {
    tried['x-appwrite-session'] = 'missing';
  }

  // 2. Appwrite JWT from Authorization: Bearer header.
  const jwt = extractJwt(req);
  if (jwt) {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setJWT(jwt);
    const res = await resolveUserWithDiagnostics(client);
    if (res.user) return res.user;
    tried['authorization'] = res.error || 'no-user';
  } else {
    tried['authorization'] = 'missing';
  }

  // 3. Legacy cookie (works if browser sets same-domain cookie).
  const cookieSession = extractCookieSession(req);
  if (cookieSession) {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setSession(cookieSession);
    const res = await resolveUserWithDiagnostics(client);
    if (res.user) return res.user;
    tried['cookie'] = res.error || 'no-user';
  } else {
    tried['cookie'] = 'missing';
  }

  // Nothing matched — log a helpful diagnostic without revealing secrets
  try {
    console.warn('[getSessionUser] authentication failed. credential presence/diagnostics:', JSON.stringify(tried));
  } catch {
    /* ignore logging issues */
  }

  return null;
}
