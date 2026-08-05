import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { uploadBytesToAppwrite } from '@/server/appwrite-storage-upload';

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

    // Forward the range through the shared byte-safe REST uploader. This
    // avoids passing a Next/undici File or Node stream to an Appwrite SDK.
    const contentRange = req.headers.get('x-chunk-range');
    const uploaded = await uploadBytesToAppwrite({
      bucketId,
      fileId,
      file,
      contentRange,
    });
    return NextResponse.json({ ok: true, fileId: uploaded.fileId }, { status: 200 });
  } catch (err: any) {
    console.error('[/api/upload/chunk]', err?.appwriteBody || err);
    return NextResponse.json(
      { error: err.message || 'Upload failed' },
      { status: Number.isInteger(err?.status) ? err.status : 500 },
    );
  }
}
