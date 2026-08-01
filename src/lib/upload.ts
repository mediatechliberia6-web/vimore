import { authFetch } from './auth-fetch';

export interface UploadResult {
  fileId: string;
  url: string;
  bucketId: string;
}

/**
 * uploadToServer — upload a File to the server-side /api/upload endpoint using authFetch.
 * Returns { fileId, url, bucketId } on success.
 */
export async function uploadToServer(file: File, bucket = 'post_media'): Promise<UploadResult> {
  const fd = new FormData();
  fd.append('file', file);
  fd.append('bucket', bucket);

  const res = await authFetch('/api/upload', { method: 'POST', body: fd });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Upload failed');
  return data as UploadResult;
}
