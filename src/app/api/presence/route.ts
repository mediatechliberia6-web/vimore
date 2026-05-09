import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';

export const maxDuration = 15;

const USERS_COLLECTION = 'users';

async function ensurePresenceAttributes(db: ReturnType<typeof getAdminDatabases>) {
  const { Databases } = await import('node-appwrite');
  const rawDb = db as any;

  const tryCreate = async (fn: () => Promise<any>) => {
    try { await fn(); } catch { /* already exists or not available — skip */ }
  };

  await tryCreate(() =>
    rawDb.createBooleanAttribute(DATABASE_ID, USERS_COLLECTION, 'is_online', false, false)
  );

  await tryCreate(() =>
    rawDb.createStringAttribute(DATABASE_ID, USERS_COLLECTION, 'last_seen_at', 64, false, undefined, undefined)
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, isOnline } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 });
    }

    const db = getAdminDatabases();
    const now = new Date().toISOString();
    const payload = { is_online: Boolean(isOnline), last_seen_at: now };

    try {
      await db.updateDocument(DATABASE_ID, USERS_COLLECTION, userId, payload);
      return NextResponse.json({ ok: true });
    } catch (updateErr: any) {
      const code = updateErr?.code ?? 0;
      const msg: string = updateErr?.message ?? '';

      if (code === 400 || msg.includes('Unknown attribute') || msg.includes('attribute')) {
        await ensurePresenceAttributes(db);
        await new Promise(r => setTimeout(r, 2000));

        await db.updateDocument(DATABASE_ID, USERS_COLLECTION, userId, payload);
        return NextResponse.json({ ok: true, created: true });
      }

      throw updateErr;
    }
  } catch (err: any) {
    console.error('[presence] POST error:', err?.message ?? err);
    return NextResponse.json({ error: err?.message || 'Internal error' }, { status: 500 });
  }
}
