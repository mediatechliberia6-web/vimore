import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

const ENDPOINT = (
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://appwrite.mediatechliberia.online/v1'
).replace(/\/$/, '');
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';
const API_KEY = process.env.APPWRITE_API_KEY || '';

/**
 * POST /api/upload
 *
 * Server-side file upload that uses the Appwrite admin API key, bypassing
 * the client-SDK permission restrictions that cause "not authorized" errors
 * when the Replit domain is not registered as an Appwrite platform.
 *
 * Body: multipart/form-data
 *   file     — the file blob
 *   bucketId — Appwrite storage bucket ID
 *   fileId   — (optional) desired file ID; auto-generated if omitted
 *
 * Response: { fileId: string }
 */
export async function POST(req: NextRequest) {
  try {
    // Verify the caller has a valid session
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucketId = formData.get('bucketId') as string | null;
    const requestedFileId = formData.get('fileId') as string | null;

    if (!file || !bucketId) {
      return NextResponse.json({ error: 'file and bucketId are required' }, { status: 400 });
    }

    // Generate a unique file ID if not provided (Appwrite-style: 20 hex chars)
    const fileId =
      requestedFileId ||
      Array.from(crypto.getRandomValues(new Uint8Array(10)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    // Proxy directly to the Appwrite REST API using the admin key.
    // node-appwrite v14 does not export InputFile, so we call the REST API
    // directly — same technique used in auth/login.ts.
    const appwriteForm = new FormData();
    appwriteForm.append('fileId', fileId);
    appwriteForm.append('file', file, (file as File).name || 'upload');

    const res = await fetch(`${ENDPOINT}/storage/buckets/${bucketId}/files`, {
      method: 'POST',
      headers: {
        'X-Appwrite-Project': PROJECT_ID,
        'X-Appwrite-Key': API_KEY,
      },
      body: appwriteForm,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error('[/api/upload] Appwrite error:', data);
      return NextResponse.json(
        { error: data?.message || 'Upload failed' },
        { status: res.status },
      );
    }

    return NextResponse.json({ fileId: data.$id });
  } catch (err: any) {
    console.error('[/api/upload]', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
