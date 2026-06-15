import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';

export async function POST(req: NextRequest) {
  try {
    const { songId } = await req.json();
    if (!songId) return NextResponse.json({ error: 'Missing songId' }, { status: 400 });

    const db = getAdminDatabases();
    const doc = await db.getDocument(DATABASE_ID, 'tracks', String(songId));
    const newCount = (doc.plays_count || doc.streams_count || 0) + 1;
    await db.updateDocument(DATABASE_ID, 'tracks', String(songId), {
      plays_count: newCount,
    });

    return NextResponse.json({ ok: true, streams: newCount });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
