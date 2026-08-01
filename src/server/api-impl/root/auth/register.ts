import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { ID } from 'node-appwrite';
import { getAdminUsers } from '@/lib/appwrite-server';

const ENDPOINT = (
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://appwrite.mediatechliberia.online/v1'
).replace(/\/$/, '');
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';

/**
 * Server-side account registration.
 *
 * Why: The Appwrite client SDK enforces a platform-domain check. Any domain
 * not registered under the Appwrite project's Platforms list will receive
 * general_unauthorized_scope (401) when calling account.create() or
 * account.createEmailPasswordSession(). This endpoint uses the admin Users
 * API (no platform check) to create the account, then creates a session via
 * a direct server-to-server REST call (same approach as auth/login.ts).
 *
 * The caller receives the session secret and can hydrate the client SDK via
 * client.setSession(secret) without needing any client-side account ops.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'email, password and name are required' },
        { status: 400 }
      );
    }

    // Create the Appwrite auth account using the admin Users API.
    // This is a server-to-server call — no platform domain check.
    const adminUsers = getAdminUsers();
    let userId: string;
    try {
      const newUser = await adminUsers.create(ID.unique(), email, undefined, password, name);
      userId = newUser.$id;
    } catch (err: any) {
      // code 409 → email already registered
      const status = err?.code === 409 ? 409 : 400;
      return NextResponse.json(
        { error: err?.message || 'Failed to create account.' },
        { status }
      );
    }

    // Create a session via direct server→Appwrite REST call.
    // Same pattern as auth/login.ts — no CORS / platform-domain restrictions.
    const sessionRes = await fetch(`${ENDPOINT}/account/sessions/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Response-Format': '1.0.0',
      },
      body: JSON.stringify({ email, password }),
    });

    const sessionData = await sessionRes.json();

    if (!sessionRes.ok) {
      // Account created but session failed — let the client know so they can
      // try logging in manually rather than silently failing.
      return NextResponse.json(
        { error: sessionData?.message || 'Account created but sign-in failed. Please log in.' },
        { status: sessionRes.status }
      );
    }

    return NextResponse.json({
      userId,
      sessionId: sessionData.$id,
      secret: sessionData.secret,
      expire: sessionData.expire,
    });
  } catch (err: any) {
    console.error('[auth/register]', err);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
