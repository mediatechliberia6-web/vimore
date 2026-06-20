import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { getSessionUser } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';
import { ID } from 'node-appwrite';

export const maxDuration = 30;

const ALLOWED_ROLES = new Set(['SUPER', 'MODERATOR']);
const COL = {
  USERS: 'users',
  NOTIFICATIONS: 'notifications',
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rl = rateLimit(`admin:suspend:${ip}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!ALLOWED_ROLES.has(session.role ?? '')) {
      return NextResponse.json({ error: 'Forbidden — admin role required' }, { status: 403 });
    }

    const { userId, days, reason, message } = await req.json();
    if (!userId || !days || !reason) {
      return NextResponse.json({ error: 'userId, days and reason are required' }, { status: 400 });
    }

    const parsedDays = Number(days);
    if (!Number.isInteger(parsedDays) || parsedDays < 1 || parsedDays > 365) {
      return NextResponse.json({ error: 'days must be an integer between 1 and 365' }, { status: 400 });
    }

    if (userId === session.userId) {
      return NextResponse.json({ error: 'Cannot suspend yourself' }, { status: 400 });
    }

    const db = getAdminDatabases();

    let targetDoc: any;
    try {
      targetDoc = await db.getDocument(DATABASE_ID, COL.USERS, userId);
    } catch {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    if (session.role === 'MODERATOR' && targetDoc.role === 'SUPER') {
      return NextResponse.json({ error: 'Moderators cannot suspend Super admins' }, { status: 403 });
    }

    let adminDoc: any;
    try {
      adminDoc = await db.getDocument(DATABASE_ID, COL.USERS, session.userId);
    } catch { /* continue */ }

    const suspendedUntil = new Date(Date.now() + parsedDays * 86_400_000).toISOString();

    await db.updateDocument(DATABASE_ID, COL.USERS, userId, {
      status: 'suspended',
      suspended_until: suspendedUntil,
      suspension_reason: String(reason),
      suspension_message: String(message || ''),
      suspended_by: adminDoc?.username || session.userId,
    });

    if (message) {
      await db.createDocument(DATABASE_ID, COL.NOTIFICATIONS, ID.unique(), {
        user_id: userId,
        from_user_id: session.userId,
        type: 'SYSTEM',
        title: 'Account Suspended',
        message: String(message),
        content: String(message),
        is_read: false,
      });
    }

    return NextResponse.json({ ok: true, suspendedUntil });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Suspension failed' }, { status: 500 });
  }
}
