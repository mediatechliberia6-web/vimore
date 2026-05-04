import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    console.log('[Zego] stream_close callback:', JSON.stringify(body));
    return NextResponse.json({ code: 0, message: 'success' });
  } catch (err) {
    console.error('[Zego] stream_close error:', err);
    return NextResponse.json({ code: 0, message: 'success' });
  }
}

export async function GET() {
  return NextResponse.json({ code: 0, message: 'success' });
}
