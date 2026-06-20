import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { getSessionUser } from '@/lib/session';
import { ID } from 'node-appwrite';

export const maxDuration = 30;

const ALLOWED_ROLES = new Set(['SUPER', 'MODERATOR']);
const COL = {
  USERS: 'users',
  VERIFICATION_RECORDS: 'verification_records',
  NOTIFICATIONS: 'notifications',
};

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!ALLOWED_ROLES.has(session.role ?? '')) {
      return NextResponse.json({ error: 'Forbidden — admin role required' }, { status: 403 });
    }

    const { recordId, reason } = await req.json();
    if (!recordId) {
      return NextResponse.json({ error: 'recordId is required' }, { status: 400 });
    }

    const db = getAdminDatabases();

    let recordDoc: any;
    try {
      recordDoc = await db.getDocument(DATABASE_ID, COL.VERIFICATION_RECORDS, recordId);
    } catch {
      return NextResponse.json({ error: 'Verification record not found' }, { status: 404 });
    }

    if (recordDoc.status !== 'PENDING') {
      return NextResponse.json({ error: `Cannot reject a record with status: ${recordDoc.status}` }, { status: 409 });
    }

    const userId: string = recordDoc.user_id;
    const currency: string = recordDoc.currency ?? 'DIAMOND';
    const amount: number = Number(recordDoc.amount ?? 0);

    await db.updateDocument(DATABASE_ID, COL.VERIFICATION_RECORDS, recordId, {
      status: 'REJECTED',
      rejected_by: session.userId,
      rejected_at: new Date().toISOString(),
      rejection_reason: reason || 'Does not meet verification requirements',
    });

    // Refund the fee if amount was recorded
    if (amount > 0) {
      const balanceField = currency === 'STAR' ? 'star_balance' : 'diamond_balance';
      try {
        const userDoc = await db.getDocument(DATABASE_ID, COL.USERS, userId);
        const currentBalance = Number(userDoc[balanceField] ?? 0);
        await db.updateDocument(DATABASE_ID, COL.USERS, userId, {
          [balanceField]: parseFloat((currentBalance + amount).toFixed(8)),
        });
      } catch { /* best-effort refund */ }
    }

    try {
      await db.createDocument(DATABASE_ID, COL.NOTIFICATIONS, ID.unique(), {
        user_id: userId,
        from_user_id: session.userId,
        type: 'SYSTEM',
        title: 'Verification Not Approved',
        content: `Your verification request was not approved. Reason: ${reason || 'Does not meet verification requirements'}. Your fee has been refunded.`,
        message: `Your verification request was not approved. Reason: ${reason || 'Does not meet verification requirements'}. Your fee has been refunded.`,
        is_read: false,
      });
    } catch { /* non-fatal */ }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Rejection failed' }, { status: 500 });
  }
}
