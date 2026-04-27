import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

const USERS_COLLECTION = 'users';
const NOTIFICATIONS_COLLECTION = 'notifications';

const ALLOWED_ROLES = new Set(['SUPER', 'MODERATOR']);

export async function POST(req: NextRequest) {
  try {
    const { adminUserId, userId, message, severity } = await req.json();

    if (!adminUserId || !userId || !message || !severity) {
      return NextResponse.json({ error: 'adminUserId, userId, message and severity required' }, { status: 400 });
    }
    if (severity !== 'SOFT' && severity !== 'FINAL') {
      return NextResponse.json({ error: 'severity must be SOFT or FINAL' }, { status: 400 });
    }

    const db = getAdminDatabases();

    let adminDoc: any;
    try {
      adminDoc = await db.getDocument(DATABASE_ID, USERS_COLLECTION, adminUserId);
    } catch {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 403 });
    }
    if (!ALLOWED_ROLES.has(adminDoc?.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    let target: any;
    try {
      target = await db.getDocument(DATABASE_ID, USERS_COLLECTION, userId);
    } catch {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 });
    }

    const newCount = (target?.warning_count || 0) + 1;
    await db.updateDocument(DATABASE_ID, USERS_COLLECTION, userId, {
      warning_count: newCount,
      last_warning_severity: severity,
      last_warning_at: new Date().toISOString(),
      last_warning_by: adminDoc?.username || adminDoc?.name || 'admin',
    });

    await db.createDocument(DATABASE_ID, NOTIFICATIONS_COLLECTION, ID.unique(), {
      user_id: userId,
      from_user_id: adminUserId,
      type: 'SYSTEM',
      title: severity === 'FINAL' ? 'Final Warning' : 'Account Warning',
      content: String(message),
      message: String(message),
      is_read: false,
    });

    return NextResponse.json({ ok: true, warning_count: newCount });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Bad request' }, { status: 400 });
  }
}
