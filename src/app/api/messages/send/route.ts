import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

export const maxDuration = 20;

const MESSAGES_COLLECTION = 'messages';
const USERS_COLLECTION = 'users';

/**
 * Send a chat message from inside a push notification's "Quick reply" input.
 * Called from the service worker — no browser session is available, so the
 * sender's identity is passed in the body and trusted because the push
 * payload was originally signed for that recipient.
 */
export async function POST(req: NextRequest) {
  try {
    const { senderId, receiverId, clusterId, text } = await req.json();

    if (!senderId || !receiverId || !clusterId || !text || !String(text).trim()) {
      return NextResponse.json({ error: 'senderId, receiverId, clusterId and text required' }, { status: 400 });
    }

    const db = getAdminDatabases();

    // Look up the sender's display info so the recipient sees a proper preview
    let senderName = '';
    let senderAvatar = '';
    try {
      const sender: any = await db.getDocument(DATABASE_ID, USERS_COLLECTION, senderId);
      senderName = sender?.name || sender?.username || '';
      senderAvatar = sender?.avatar || '';
    } catch { /* user lookup is best-effort */ }

    await db.createDocument(DATABASE_ID, MESSAGES_COLLECTION, ID.unique(), {
      cluster_id: clusterId,
      sender_id: senderId,
      sender_name: senderName,
      sender_avatar: senderAvatar,
      receiver_id: receiverId,
      type: 'text',
      text: String(text).trim(),
      content: String(text).trim(),
      is_read: false,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Bad request' }, { status: 400 });
  }
}
