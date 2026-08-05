import 'server-only';

type UploadFile = {
  arrayBuffer(): Promise<ArrayBuffer>;
  name?: string;
  type?: string;
  size: number;
};

const ENDPOINT = (
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
  'https://appwrite.mediatechliberia.online/v1'
).replace(/\/$/, '');
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';
const API_KEY = process.env.APPWRITE_API_KEY || '';

export const APPWRITE_UPLOAD_ENDPOINT = ENDPOINT;

/**
 * Appwrite 1.6 storage upload through REST.
 *
 * Do not pass the request's File object directly to a client or node-appwrite
 * Storage instance. Next's web File and Node's stream-like upload types are
 * not interchangeable; Appwrite 1.6 can surface that mismatch as
 * "source.on is not a function". Copying the bytes into a standard Blob keeps
 * the outgoing undici FormData request stream-compatible.
 */
export async function uploadBytesToAppwrite({
  bucketId,
  fileId,
  file,
  contentRange,
}: {
  bucketId: string;
  fileId: string;
  file: UploadFile;
  contentRange?: string | null;
}): Promise<{ fileId: string; status: number }> {
  if (!API_KEY) {
    throw new Error('APPWRITE_API_KEY is not configured on the server');
  }

  const bytes = await file.arrayBuffer();
  const blob = new Blob([bytes], { type: file.type || 'application/octet-stream' });
  const form = new FormData();
  form.append('fileId', fileId);
  form.append('file', blob, file.name || 'upload');

  const headers: Record<string, string> = {
    'X-Appwrite-Project': PROJECT_ID,
    'X-Appwrite-Key': API_KEY,
  };
  if (contentRange) headers['Content-Range'] = contentRange;
  if (contentRange) headers['X-Appwrite-Id'] = fileId;

  const response = await fetch(
    `${ENDPOINT}/storage/buckets/${encodeURIComponent(bucketId)}/files`,
    { method: 'POST', headers, body: form },
  );

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof body?.message === 'string' ? body.message : `Appwrite upload failed (${response.status})`;
    throw Object.assign(new Error(message), { status: response.status, appwriteBody: body });
  }

  return { fileId: body?.$id || fileId, status: response.status };
}