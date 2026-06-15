import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';

export async function POST(req: NextRequest) {
  try {
    const { songId } = await req.json();
    if (!songId) return NextResponse.json({ error: 'Missing songId' }, { status: 400 });

    const db = getAdminDatabases();
    const doc = await db.getDocument(DATABASE_ID, 'tracks', String(songId));
    await db.updateDocument(DATABASE_ID, 'tracks', String(songId), {
      streams_count: (doc.streams_count || 0) + 1,
    });

    return NextResponse.json({ ok: true, streams: (doc.streams_count || 0) + 1 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
