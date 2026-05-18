import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage } from '@/lib/appwrite-server';
import { ID, InputFile } from 'node-appwrite';

const ENDPOINT = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://mediatechliberia.online/v1').replace(/\/$/, '');
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'image';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bucketId = type === 'voice' ? 'voice_messages' : 'message_media';
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const inputFile = InputFile.fromBuffer(buffer, file.name || `upload_${Date.now()}`);

    const storage = getAdminStorage();
    const uploaded = await storage.createFile(bucketId, ID.unique(), inputFile);

    const url = `${ENDPOINT}/storage/buckets/${bucketId}/files/${uploaded.$id}/view?project=${PROJECT_ID}`;
    return NextResponse.json({ fileId: uploaded.$id, url, bucketId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
