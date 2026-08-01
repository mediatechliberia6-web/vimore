import 'server-only';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

export async function GET(req: Request) {
  try {
    const xAppwrite = req.headers.get('x-appwrite-session');
    const auth = req.headers.get('authorization');
    const cookie = req.headers.get('cookie');

    let session = null;
    let sessionError: string | null = null;
    try {
      session = await getSessionUser(req);
    } catch (err: any) {
      sessionError = err?.message || String(err);
    }

    return NextResponse.json({
      receivedHeaders: {
        hasXAppwriteSession: !!xAppwrite,
        hasAuthorization: !!auth,
        hasCookie: !!cookie,
      },
      session: session ? { userId: session.userId, role: session.role } : null,
      sessionError,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'debug failed' }, { status: 500 });
  }
}
