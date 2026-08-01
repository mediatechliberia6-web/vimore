/**
 * upload.ts — client-side helper for server-proxied file uploads.
 *
 * All direct storage.createFile() calls on the client SDK fail when the
 * Replit (or any unregistered) domain tries to reach Appwrite storage,
 * producing "not authorized" errors. This helper routes uploads through
 * /api/upload, which uses the admin API key server-side and is never
 * blocked by platform/domain restrictions.
 */

import { authFetch } from './auth-fetch';

/**
 * Upload a file via the server-side /api/upload endpoint.
 *
 * @param file     The File object to upload.
 * @param bucketId The Appwrite storage bucket ID (use BUCKET.* constants).
 * @param fileId   Optional desired file ID; auto-generated if omitted.
 * @returns        The Appwrite fileId (use getFileUrl() to build a URL from it).
 */
export async function uploadViaServer(
  file: File,
  bucketId: string,
  fileId?: string,
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucketId', bucketId);
  if (fileId) formData.append('fileId', fileId);

  const res = await authFetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || 'Upload failed');
  }

  return data.fileId as string;
}
