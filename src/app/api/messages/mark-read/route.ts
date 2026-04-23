import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

const MESSAGES_COLLECTION = 'messages';

/**
 * Marks all unread messages addressed to `recipientId` (optionally
 * filtered by sender or cluster) as read. Called from the service
 * worker when the user taps the "Mark as read" push action.
 */
export async function POST(req: NextRequest) {
  try {
    const { recipientId, senderId, clusterId } = await req.json();

    if (!recipientId) {
      return NextResponse.json({ error: 'recipientId required' }, { status: 400 });
    }

    const db = getAdminDatabases();

    const filters = [
      Query.equal('receiver_id', recipientId),
      Query.equal('is_read', false),
      Query.limit(100),
    ];
    if (senderId) filters.push(Query.equal('sender_id', senderId));
    if (clusterId) filters.push(Query.equal('cluster_id', clusterId));

    let updated = 0;
    try {
      const res = await db.listDocuments(DATABASE_ID, MESSAGES_COLLECTION, filters);
      await Promise.all(
        res.documents.map(async (doc: any) => {
          try {
            await db.updateDocument(DATABASE_ID, MESSAGES_COLLECTION, doc.$id, { is_read: true });
            updated++;
          } catch { /* ignore individual failures */ }
        })
      );
    } catch (err: any) {
      console.warn('[messages/mark-read] failed:', err?.message || err);
    }

    return NextResponse.json({ ok: true, updated });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Bad request' }, { status: 400 });
  }
}
