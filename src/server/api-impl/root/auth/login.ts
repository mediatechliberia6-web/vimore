import 'server-only';
import { NextRequest, NextResponse } from 'next/server';

const ENDPOINT = (
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://appwrite.mediatechliberia.online/v1'
).replace(/\/$/, '');
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';

/**
 * Server-side login — proxies the credential check directly to Appwrite's
 * REST API so it is a server-to-server call with no CORS / platform-domain
 * restrictions. The client SDK path suffers from "general_unauthorized_scope"
 * when the Replit preview domain is not registered as an Appwrite platform.
 */
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
    }

    // Direct server → Appwrite call — no platform check, no CORS.
    const res = await fetch(`${ENDPOINT}/account/sessions/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Response-Format': '1.0.0',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || 'Invalid credentials.' },
        { status: res.status }
      );
    }

    // Return the session secret and userId so the client can hydrate its SDK
    return NextResponse.json({
      sessionId: data.$id,
      secret: data.secret,
      userId: data.userId,
      expire: data.expire,
    });
  } catch (err: any) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}
