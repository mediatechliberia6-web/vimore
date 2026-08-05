import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

const ENDPOINT = (
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://appwrite.mediatechliberia.online/v1'
).replace(/\/$/, '');
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';
const API_KEY = process.env.APPWRITE_API_KEY || '';

/**
 * Allowed buckets for admin-key uploads.
 * Keep this allowlist narrow — never let callers write to arbitrary buckets
 * with the admin key.
 */
const ALLOWED_BUCKETS = new Set([
  'post_media',
  'story_media',
  'reel_media',
  'message_media',
  'voice_messages',
  'avatars',
  'covers',
  'music_tracks',
  'album_covers',
  'payment_screenshots',
  'event_flyers',
  'Marketplace_Images',
  'store_logos',
  'sounds',
]);

/** 200 MB hard limit for the single-request endpoint. */
const MAX_FILE_BYTES = 200 * 1024 * 1024;

/**
 * POST /api/upload
 *
 * Server-side file upload that uses the Appwrite admin API key, bypassing
 * the client-SDK permission restrictions that cause "not authorized" errors
 * when the Replit domain is not registered as an Appwrite platform.
 *
 * Body: multipart/form-data
 *   file     — the file blob (max 200 MB; use /api/upload/chunk for larger)
 *   bucketId — Appwrite storage bucket ID (must be in ALLOWED_BUCKETS)
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

    if (!ALLOWED_BUCKETS.has(bucketId)) {
      return NextResponse.json({ error: 'Upload to this bucket is not permitted' }, { status: 403 });
    }

    if ((file as File).size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: 'File too large for single upload; use chunked upload instead' },
        { status: 413 },
      );
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
