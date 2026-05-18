import { NextRequest, NextResponse } from 'next/server';
import { Client, Databases, Query } from 'node-appwrite';

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://mediatechliberia.online/v1';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';
const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || 'vimoreprod';
const API_KEY = process.env.APPWRITE_API_KEY || '';

const AI_CONVERSATIONS = 'AI_CONVERSATIONS';
const AI_MESSAGES = 'AI_MESSAGES';

export async function DELETE(req: NextRequest) {
  try {
    const { conversationId, userId } = await req.json();
    if (!conversationId || !userId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const client = new Client()
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(PROJECT_ID)
      .setKey(API_KEY);

    const db = new Databases(client);

    const conv = await db.getDocument(DATABASE_ID, AI_CONVERSATIONS, conversationId);
    if (conv.user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    let cursor: string | null = null;
    while (true) {
      const q: string[] = [
        Query.equal('conversation_id', conversationId),
        Query.limit(100),
      ];
      if (cursor) q.push(Query.cursorAfter(cursor));
      const msgs = await db.listDocuments(DATABASE_ID, AI_MESSAGES, q);
      for (const msg of msgs.documents) {
        await db.deleteDocument(DATABASE_ID, AI_MESSAGES, msg.$id);
      }
      if (msgs.documents.length < 100) break;
      cursor = msgs.documents[msgs.documents.length - 1].$id;
    }

    await db.deleteDocument(DATABASE_ID, AI_CONVERSATIONS, conversationId);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed' }, { status: 500 });
  }
}
