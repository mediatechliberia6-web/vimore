import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export const maxDuration = 20;

const ENDPOINT = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://mediatechliberia.online/v1').replace(/\/$/, '');
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';
const ADMIN_ROLES = new Set(['SUPER', 'FINANCIAL', 'MODERATOR']);

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();
    if (!identifier || !password) {
      return NextResponse.json({ error: 'Identifier and password are required.' }, { status: 400 });
    }

    const db = getAdminDatabases();

    // Resolve email from username or phone
    let email: string | null = null;
    try {
      const byUsername = await db.listDocuments(DATABASE_ID, 'users', [
        Query.equal('username', identifier.replace(/^@/, '')),
        Query.limit(1),
      ]);
      if (byUsername.documents.length > 0) {
        email = byUsername.documents[0].email ?? null;
      }
    } catch { /* ignore */ }

    if (!email && identifier.includes('@') && !identifier.includes('.cfd')) {
      email = identifier;
    }

    if (!email) {
      try {
        const byPhone = await db.listDocuments(DATABASE_ID, 'users', [
          Query.equal('phone', identifier),
          Query.limit(1),
        ]);
        if (byPhone.documents.length > 0) {
          email = byPhone.documents[0].email ?? null;
        }
      } catch { /* ignore */ }
    }

    if (!email) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
    }

    // Create session via Appwrite REST API
    const sessionRes = await fetch(`${ENDPOINT}/account/sessions/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID,
      },
      body: JSON.stringify({ email, password }),
    });

    if (!sessionRes.ok) {
      const err = await sessionRes.json().catch(() => ({}));
      const msg: string = err?.message || '';
      if (msg.toLowerCase().includes('invalid credentials') || sessionRes.status === 401) {
        return NextResponse.json({ error: 'Invalid password.' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 });
    }

    const sessionData = await sessionRes.json();
    const sessionSecret: string = sessionData.secret ?? sessionData.$id ?? '';

    // Verify admin role using the new session
    const accountRes = await fetch(`${ENDPOINT}/account`, {
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Session': sessionSecret,
      },
    });

    if (!accountRes.ok) {
      return NextResponse.json({ error: 'Could not verify account.' }, { status: 401 });
    }

    const accountData = await accountRes.json();
    const userId: string = accountData.$id;

    let role = 'USER';
    try {
      const userDoc = await db.getDocument(DATABASE_ID, 'users', userId);
      role = userDoc?.role ?? 'USER';
    } catch { /* no role doc */ }

    const authorized = ADMIN_ROLES.has(role);

    return NextResponse.json({ authorized, role, session: sessionSecret, userId });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Login failed.' }, { status: 500 });
  }
}
