import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';

export async function POST(req: NextRequest) {
  try {
    const { callDocId } = await req.json();
    if (!callDocId) {
      return NextResponse.json({ error: 'callDocId required' }, { status: 400 });
    }

    const db = getAdminDatabases();

    try {
      await db.deleteDocument(DATABASE_ID, 'calls', callDocId);
    } catch (err: any) {
      if (err?.code !== 404) throw err;
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[call/decline]', err);
    return NextResponse.json({ error: err?.message || 'Failed' }, { status: 500 });
  }
}
