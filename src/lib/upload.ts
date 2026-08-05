/**
 * upload.ts — client-side helpers for server-proxied file uploads.
 *
 * All direct storage.createFile() calls on the client SDK fail when the
 * Replit (or any unregistered) domain tries to reach Appwrite storage,
 * producing "not authorized" errors. These helpers route uploads through
 * /api/upload (single request) or /api/upload/chunk (chunked, for large
 * files), which use the admin API key server-side and are never blocked by
 * platform/domain restrictions.
 */

import { authFetch } from './auth-fetch';

export const UPLOAD_CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB per chunk

/**
 * Upload a file via the server-side /api/upload endpoint (single request).
 * Best for small-to-medium files (avatars, covers, images, audio).
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

export interface ChunkedUploadViaServerOptions {
  onProgress?: (pct: number) => void;
  signal?: AbortSignal;
  chunkSize?: number;
}

/**
 * Upload a large file via the server-side /api/upload/chunk endpoint.
 * Breaks the file into chunks, forwards each with Content-Range, and
 * reports progress. Respects an AbortSignal for cancellation.
 *
 * Best for large videos (reels). The server proxies each chunk to Appwrite
 * using the admin API key, so no domain registration is required.
 *
 * @param file     The File object to upload.
 * @param bucketId The Appwrite storage bucket ID (use BUCKET.* constants).
 * @param fileId   The Appwrite file ID for this upload session.
 * @param options  Progress callback and AbortSignal.
 * @returns        The Appwrite fileId.
 */
export async function chunkedUploadViaServer(
  file: File,
  bucketId: string,
  fileId: string,
  options: ChunkedUploadViaServerOptions = {},
): Promise<string> {
  const { onProgress, signal, chunkSize = UPLOAD_CHUNK_SIZE } = options;
  const totalSize = file.size;

  // Small files: single request is fine
  if (totalSize <= chunkSize) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('bucketId', bucketId);
    formData.append('fileId', fileId);

    const res = await authFetch('/api/upload/chunk', {
      method: 'POST',
      body: formData,
      signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || `Upload failed (${res.status})`);
    onProgress?.(1);
    return fileId;
  }

  let offset = 0;
  while (offset < totalSize) {
    if (signal?.aborted) throw new Error('Upload cancelled');

    const chunkEnd = Math.min(offset + chunkSize, totalSize);
    const chunk = file.slice(offset, chunkEnd);
    const chunkFile = new File([chunk], file.name, { type: file.type });

    const formData = new FormData();
    formData.append('file', chunkFile, file.name);
    formData.append('bucketId', bucketId);
    formData.append('fileId', fileId);

    // We pass the range via a custom header that the server forwards as
    // Content-Range to Appwrite (browsers block direct Content-Range writes).
    const rangeHeader = `bytes ${offset}-${chunkEnd - 1}/${totalSize}`;

    let attempt = 0;
    const maxRetries = 3;
    let lastErr: Error | null = null;

    while (attempt < maxRetries) {
      if (signal?.aborted) throw new Error('Upload cancelled');
      try {
        const res = await authFetch('/api/upload/chunk', {
          method: 'POST',
          headers: { 'x-chunk-range': rangeHeader },
          body: formData,
          signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        lastErr = null;
        break;
      } catch (e: any) {
        if (signal?.aborted || e?.name === 'AbortError') throw new Error('Upload cancelled');
        lastErr = e instanceof Error ? e : new Error(String(e));
        attempt++;
        if (attempt < maxRetries) await new Promise(r => setTimeout(r, 1500 * attempt));
      }
    }

    if (lastErr) throw lastErr;

    offset = chunkEnd;
    onProgress?.(offset / totalSize);
  }

  return fileId;
}
