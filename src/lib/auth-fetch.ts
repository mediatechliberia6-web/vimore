/**
 * authFetch — drop-in fetch wrapper that attaches an Appwrite JWT as
 * Authorization: Bearer <jwt> so server-side routes can verify the caller.
 *
 * Why: The Appwrite web SDK stores sessions in localStorage (not cookies) in
 * browser environments, so req.cookies on the server is always empty.
 * Passing a short-lived JWT via header is the correct bridge.
 */

import { account } from './appwrite';

interface JwtCache {
  token: string;
  expiresAt: number;
}

let jwtCache: JwtCache | null = null;
const JWT_TTL_MS = 10 * 60 * 1000; // 10 minutes (Appwrite JWTs last 15)

async function getJwt(): Promise<string | null> {
  try {
    if (jwtCache && Date.now() < jwtCache.expiresAt) {
      return jwtCache.token;
    }
    const result = await account.createJWT();
    jwtCache = { token: result.jwt, expiresAt: Date.now() + JWT_TTL_MS };
    return result.jwt;
  } catch {
    jwtCache = null;
    return null;
  }
}

export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const jwt = await getJwt();
  const headers = new Headers(options.headers as HeadersInit | undefined);
  if (jwt) {
    headers.set('Authorization', `Bearer ${jwt}`);
  }
  return fetch(url, { ...options, headers });
}

/** Call this on logout to clear the cached JWT. */
export function clearJwtCache() {
  jwtCache = null;
}
