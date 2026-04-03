import { NextRequest, NextResponse } from 'next/server';
import { Client, Account } from 'appwrite';
import { getAdminUsers } from '@/lib/appwrite-server';

const ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const COOKIE_NAME = `a_session_${PROJECT_ID.toLowerCase()}`;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const jwt = searchParams.get('jwt');

  const hostname = request.headers.get('host') || '';
  const isFreeDomain = hostname === 'free.vimore.cfd' || hostname.startsWith('free.');
  const destination = isFreeDomain ? '/free-mode' : '/';

  if (!jwt) {
    return NextResponse.redirect(new URL(destination, request.url));
  }

  try {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setJWT(jwt);

    const accountClient = new Account(client);
    const user = await accountClient.get();

    const users = getAdminUsers();
    const session = await users.createSession(user.$id);

    const response = NextResponse.redirect(new URL(destination, request.url));

    response.cookies.set(COOKIE_NAME, session.secret, {
      path: '/',
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });

    response.cookies.set(`${COOKIE_NAME}_legacy`, session.secret, {
      path: '/',
      secure: true,
      sameSite: 'none',
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch {
    return NextResponse.redirect(new URL(destination, request.url));
  }
}
