import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/appwrite-server';
import { getSessionUser } from '@/lib/session';
import { rateLimit, sanitizeIp } from '@/lib/rate-limit';
import { ID } from 'node-appwrite';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { InputFile } = require('node-appwrite') as any;

const ENDPOINT = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || '').replace(/\/$/, '');
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const ALLOWED_MIME_PREFIXES = ['image/', 'audio/', 'video/'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export async function POST(req: NextRequest) {
  try {
    const ip = sanitizeIp(req.headers.get('x-forwarded-for')?.split(',')[0].trim());
    const rl = rateLimit(`upload:${ip}`, 20, 60_000);
    if (!rl.allowed) return NextResponse.json({ error: 'Upload rate limit reached.' }, { status: 429 });

    // Authenticate the request
    const session = await getSessionUser(req);
    if (!session) return NextResponse.json({ error: 'Authentication required to upload files.' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const bucket = String(formData.get('bucket') || 'post_media');

    if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });

    if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: 'File too large. Maximum 50 MB.' }, { status: 400 });

    const isAllowed = ALLOWED_MIME_PREFIXES.some(p => file.type.startsWith(p));
    if (!isAllowed) return NextResponse.json({ error: 'Only image, audio and video files are allowed.' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const inputFile = (InputFile as any).fromBuffer(buffer, file.name || `upload_${Date.now()}`);

    const storage = getAdminStorage();
    const uploaded = await storage.createFile(bucket, ID.unique(), inputFile);

    const url = `${ENDPOINT}/storage/buckets/${bucket}/files/${uploaded.$id}/view?project=${PROJECT_ID}`;
    return NextResponse.json({ fileId: uploaded.$id, url, bucketId: bucket });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
