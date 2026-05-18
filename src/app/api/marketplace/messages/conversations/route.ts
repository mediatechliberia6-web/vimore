import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sellerId = searchParams.get('sellerId');

  if (!sellerId) {
    return NextResponse.json({ error: 'Missing sellerId' }, { status: 400 });
  }

  try {
    const db = getAdminDatabases();

    // Use indexed receiver_id field. cluster_id is not indexed.
    // Fetch messages TO the seller (buyer→seller direction), latest first
    const result = await db.listDocuments(DATABASE_ID, 'messages', [
      Query.equal('receiver_id', sellerId),
      Query.orderDesc('$createdAt'),
      Query.limit(500),
    ]);

    // Filter client-side to only marketplace cluster IDs
    const mktPrefix = `mkt_${sellerId}_`;
    const convMap = new Map<string, Record<string, unknown>>();
    for (const doc of result.documents) {
      const cid = String(doc.cluster_id || '');
      if (!cid.startsWith(mktPrefix)) continue;
      if (!convMap.has(cid)) {
        convMap.set(cid, doc as unknown as Record<string, unknown>);
      }
    }

    // Parse cluster_id: mkt_{sellerId}_{buyerId}
    const conversations = Array.from(convMap.entries()).map(([cid, doc]) => {
      const buyerId = cid.slice(mktPrefix.length); // everything after the prefix
      return {
        clusterId: cid,
        buyerId,
        senderName: String(doc.sender_name || 'Buyer'),
        lastMessage: String(
          doc.text ||
          (doc.type === 'photo' ? '📷 Photo' : doc.type === 'voice' ? '🎙️ Voice message' : '📎 Media')
        ),
        lastTime: String(doc.$createdAt || ''),
        isRead: Boolean(doc.is_read),
        type: String(doc.type || 'text'),
      };
    });

    return NextResponse.json({ conversations });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch conversations';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
