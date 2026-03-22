import { NextRequest, NextResponse } from 'next/server';

const MAIN_DOMAIN = 'vimore.cfd';
const FREE_DOMAIN = 'free.vimore.cfd';
const FREE_MODE_COOKIE = 'vimore_free_mode';

const STATIC_PREFIXES = ['/_next', '/sw.js', '/offline.html', '/favicon', '/icon', '/manifest'];

function isStaticAsset(pathname: string): boolean {
  return STATIC_PREFIXES.some((p) => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const pathname = request.nextUrl.pathname;

  if (isStaticAsset(pathname)) {
    return NextResponse.next();
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  const isFreeDomain =
    hostname === FREE_DOMAIN || hostname.startsWith('free.');

  const isFreeModeRoute = pathname.startsWith('/free-mode') || pathname.startsWith('/api');

  if (isFreeModeRoute && !isFreeDomain) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (isFreeDomain) {
    const url = request.nextUrl.clone();
    url.pathname = '/free-mode' + (pathname === '/' ? '' : pathname);
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  const isMainDomain =
    hostname === MAIN_DOMAIN ||
    hostname.endsWith('.replit.dev') ||
    hostname.endsWith('.repl.co') ||
    hostname.includes('localhost');

  if (isMainDomain) {
    const freeModeCookie = request.cookies.get(FREE_MODE_COOKIE)?.value;
    if (freeModeCookie === 'true') {
      const redirectUrl = `https://${FREE_DOMAIN}${pathname}`;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sw\\.js|offline\\.html).*)',
  ],
};
