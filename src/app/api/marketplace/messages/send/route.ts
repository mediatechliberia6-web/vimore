import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      clusterId, sellerId, senderName, senderId,
      text, type = 'text', mediaUrl, mediaId, voiceDuration,
    } = body;

    if (!clusterId || !sellerId || !senderName || !senderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (!text && !mediaUrl) {
      return NextResponse.json({ error: 'Message has no content' }, { status: 400 });
    }

    const db = getAdminDatabases();

    const docData: Record<string, unknown> = {
      cluster_id: clusterId,
      sender_id: senderId,
      sender_name: senderName,
      receiver_id: sellerId,
      type,
      is_read: false,
    };

    if (text) docData.text = text;
    if (mediaUrl) docData.media_url = mediaUrl;
    if (mediaId) docData.media_id = mediaId;
    if (voiceDuration) docData.voice_duration = voiceDuration;

    const doc = await db.createDocument(DATABASE_ID, 'messages', ID.unique(), docData);
    return NextResponse.json({ message: doc }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send message';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
