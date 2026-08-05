import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { rateLimit, sanitizeIp } from '@/lib/rate-limit';
import { ID } from 'node-appwrite';

const ENDPOINT = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://appwrite.mediatechliberia.online/v1').replace(/\/$/, '');
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';
const API_KEY = process.env.APPWRITE_API_KEY || '';

const ALLOWED_MIME_PREFIXES = ['image/', 'audio/', 'video/'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  try {
    const ip = sanitizeIp(req.headers.get('x-forwarded-for')?.split(',')[0].trim());
    const rl = rateLimit(`mkt-upload:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Upload rate limit reached.' }, { status: 429 });
    }

    // Only authenticated users may upload
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Authentication required to upload files.' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'image';

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // File size guard
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum 50 MB.' }, { status: 400 });
    }

    // MIME type guard — only allow media types
    const isAllowedType = ALLOWED_MIME_PREFIXES.some(prefix => file.type.startsWith(prefix));
    if (!isAllowedType) {
      return NextResponse.json({ error: 'Only image, audio, and video files are allowed.' }, { status: 400 });
    }

    const bucketId = type === 'voice' ? 'voice_messages' : 'message_media';
    const fileId = ID.unique();

    // Use REST API directly — node-appwrite v14 InputFile is broken in edge/Node 20 contexts
    const appwriteForm = new FormData();
    appwriteForm.append('fileId', fileId);
    appwriteForm.append('file', file, file.name || `upload_${Date.now()}`);

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
      console.error('[marketplace/messages/upload] Appwrite error:', data);
      return NextResponse.json({ error: data?.message || 'Upload failed' }, { status: res.status });
    }

    const url = `${ENDPOINT}/storage/buckets/${bucketId}/files/${data.$id}/view?project=${PROJECT_ID}`;
    return NextResponse.json({ fileId: data.$id, url, bucketId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    console.error('[marketplace/messages/upload]', err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
