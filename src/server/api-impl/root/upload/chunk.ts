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
 * Keep this allowlist narrow — do not expose admin key to arbitrary buckets.
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

/** 500 MB hard limit per chunk (Appwrite itself caps at 5 GB per file) */
const MAX_CHUNK_BYTES = 500 * 1024 * 1024;

/**
 * POST /api/upload/chunk
 *
 * Server-side chunked-upload proxy. Accepts a single binary chunk and
 * forwards it to Appwrite storage using the admin API key, so the upload
 * works regardless of which domain the browser is on.
 *
 * Multipart body fields:
 *   file     — the chunk blob (required)
 *   bucketId — Appwrite storage bucket ID (must be in ALLOWED_BUCKETS)
 *   fileId   — Appwrite file ID for this upload session (required)
 *
 * Forward the original Content-Range and x-appwrite-id headers as-is.
 * The client is responsible for splitting the file and sequencing chunks.
 *
 * Response: { ok: true } on success, or { error: string } with an HTTP
 * error status on failure. The final chunk response from Appwrite (HTTP 201)
 * is returned directly so the client can detect completion.
 */
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser(req);
    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucketId = formData.get('bucketId') as string | null;
    const fileId = formData.get('fileId') as string | null;

    if (!file || !bucketId || !fileId) {
      return NextResponse.json(
        { error: 'file, bucketId, and fileId are required' },
        { status: 400 },
      );
    }

    if (!ALLOWED_BUCKETS.has(bucketId)) {
      return NextResponse.json({ error: 'Upload to this bucket is not permitted' }, { status: 403 });
    }

    if (file.size > MAX_CHUNK_BYTES) {
      return NextResponse.json(
        { error: `Chunk exceeds maximum size of ${MAX_CHUNK_BYTES / 1024 / 1024} MB` },
        { status: 413 },
      );
    }

    const appwriteForm = new FormData();
    appwriteForm.append('fileId', fileId);
    appwriteForm.append('file', file, file.name || 'chunk');

    // Forward range headers from the original request so Appwrite can
    // reassemble the file correctly across multiple chunks.
    const forwardHeaders: Record<string, string> = {
      'X-Appwrite-Project': PROJECT_ID,
      'X-Appwrite-Key': API_KEY,
      // x-appwrite-id tells Appwrite which upload session this chunk belongs to
      'x-appwrite-id': fileId,
    };
    const contentRange = req.headers.get('x-chunk-range');
    if (contentRange) forwardHeaders['content-range'] = contentRange;

    const res = await fetch(`${ENDPOINT}/storage/buckets/${bucketId}/files`, {
      method: 'POST',
      headers: forwardHeaders,
      body: appwriteForm,
    });

    // 201 = final chunk accepted; 200/204 = intermediate chunk accepted
    if (res.status === 201 || res.status === 200 || res.status === 204) {
      const body = await res.json().catch(() => ({}));
      return NextResponse.json({ ok: true, fileId: body.$id || fileId }, { status: 200 });
    }

    const errBody = await res.json().catch(() => ({}));
    console.error('[/api/upload/chunk] Appwrite error:', errBody);
    return NextResponse.json(
      { error: errBody?.message || `Upload failed (${res.status})` },
      { status: res.status >= 400 && res.status < 600 ? res.status : 500 },
    );
  } catch (err: any) {
    console.error('[/api/upload/chunk]', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
