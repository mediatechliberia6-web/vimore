import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { getSessionUser } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';
import { ID, Query } from 'node-appwrite';

export const maxDuration = 30;

const ALLOWED_ROLES = new Set(['SUPER', 'MODERATOR']);
const COL = {
  USERS: 'users',
  POSTS: 'posts',
  USER_BANS: 'user_bans',
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rl = rateLimit(`admin:ban:${ip}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    // Caller identity from session — body carries only the target
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!ALLOWED_ROLES.has(session.role ?? '')) {
      return NextResponse.json({ error: 'Forbidden — admin role required' }, { status: 403 });
    }

    const { userId, reason, note } = await req.json();
    if (!userId || !reason) {
      return NextResponse.json({ error: 'userId and reason are required' }, { status: 400 });
    }

    // Prevent self-ban
    if (userId === session.userId) {
      return NextResponse.json({ error: 'Cannot ban yourself' }, { status: 400 });
    }

    const db = getAdminDatabases();

    // Verify target exists
    let targetDoc: any;
    try {
      targetDoc = await db.getDocument(DATABASE_ID, COL.USERS, userId);
    } catch {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    // A MODERATOR cannot ban a SUPER admin
    if (session.role === 'MODERATOR' && targetDoc.role === 'SUPER') {
      return NextResponse.json({ error: 'Moderators cannot ban Super admins' }, { status: 403 });
    }

    // Get admin username for audit trail
    let adminDoc: any;
    try {
      adminDoc = await db.getDocument(DATABASE_ID, COL.USERS, session.userId);
    } catch { /* continue */ }

    await db.updateDocument(DATABASE_ID, COL.USERS, userId, {
      status: 'banned',
      ban_reason: String(reason),
      ban_note: String(note || ''),
      banned_at: new Date().toISOString(),
      banned_by: adminDoc?.username || session.userId,
    });

    // Delete user's posts
    try {
      const postsRes = await db.listDocuments(DATABASE_ID, COL.POSTS, [
        Query.equal('user_id', userId),
        Query.limit(500),
      ]);
      await Promise.allSettled(
        postsRes.documents.map((doc) =>
          db.deleteDocument(DATABASE_ID, COL.POSTS, doc.$id)
        )
      );
    } catch { /* non-fatal */ }

    // Audit log
    await db.createDocument(DATABASE_ID, COL.USER_BANS, ID.unique(), {
      user_id: userId,
      reason: String(reason),
      banned_by: session.userId,
      is_permanent: true,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Ban failed' }, { status: 500 });
  }
}
