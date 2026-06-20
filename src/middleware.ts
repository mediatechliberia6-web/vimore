import { NextRequest, NextResponse } from 'next/server';

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';

const SESSION_COOKIE = `a_session_${PROJECT_ID}`;
const SESSION_COOKIE_LEGACY = `a_session_${PROJECT_ID}_legacy`;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const hasSession =
      request.cookies.has(SESSION_COOKIE) ||
      request.cookies.has(SESSION_COOKIE_LEGACY);

    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
