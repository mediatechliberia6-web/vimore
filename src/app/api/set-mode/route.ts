import { NextRequest, NextResponse } from 'next/server';

const MAIN_DOMAIN = 'vimore.cfd';
const FREE_DOMAIN = 'free.vimore.cfd';
const FREE_MODE_COOKIE = 'vimore_free_mode';

export async function POST(request: NextRequest) {
  const { enable } = await request.json();

  const redirectUrl = enable
    ? `https://${FREE_DOMAIN}`
    : `https://${MAIN_DOMAIN}`;

  const response = NextResponse.json({ redirectUrl });

  if (enable) {
    response.cookies.set(FREE_MODE_COOKIE, 'true', {
      domain: `.${MAIN_DOMAIN}`,
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      secure: true,
    });
  } else {
    response.cookies.set(FREE_MODE_COOKIE, '', {
      domain: `.${MAIN_DOMAIN}`,
      path: '/',
      maxAge: 0,
      secure: true,
    });
  }

  return response;
}
