import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    // Try fetching the profile document (best-effort)
    try {
      const db = getAdminDatabases();
      const profile = await db.getDocument(DATABASE_ID, 'users', session.userId);
      return NextResponse.json({ userId: session.userId, role: session.role, profile });
    } catch {
      // If profile fetch fails, still return the session identity
      return NextResponse.json({ userId: session.userId, role: session.role });
    }
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error).message || 'Could not verify session' }, { status: 500 });
  }
}
