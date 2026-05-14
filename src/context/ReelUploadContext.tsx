'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';

export type UploadStatus = 'uploading' | 'done' | 'error';

export type ReelUploadJob = {
  id: string;
  progress: number;
  label: string;
  status: UploadStatus;
  error?: string;
};

type SelectedSound = {
  id: string;
  title: string;
  artist: string;
  startTime: number;
  fileId: string;
};

export type ReelUploadPayload = {
  clips: Blob[];
  totalDuration: number;
  effect: string;
  caption: string;
  visibility: 'public' | 'friends' | 'private';
  allowComments: boolean;
  allowDuet: boolean;
  allowDownloads: boolean;
  selectedSound: SelectedSound | null;
  userId: string;
  username: string;
  coverBlob: Blob | null;
};

type CtxValue = {
  job: ReelUploadJob | null;
  startUpload: (payload: ReelUploadPayload) => void;
  dismissJob: () => void;
};

const Ctx = createContext<CtxValue>({ job: null, startUpload: () => {}, dismissJob: () => {} });

/* Upload via XMLHttpRequest so we get real upload progress on slow connections */
function xhrUpload(
  formData: FormData,
  onProgress: (pct: number) => void,
): Promise<{ ok: boolean; error?: string }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/upload/reel');

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 80)); // 0–80% = actual upload
      }
    });

    xhr.addEventListener('load', () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300 && data.ok) {
          resolve({ ok: true });
        } else {
          resolve({ ok: false, error: data.error || `Server error ${xhr.status}` });
        }
      } catch {
        resolve({ ok: false, error: `Server error ${xhr.status}` });
      }
    });

    xhr.addEventListener('error', () => resolve({ ok: false, error: 'Network error — check your connection' }));
    xhr.addEventListener('timeout', () => resolve({ ok: false, error: 'Upload timed out — try a shorter video' }));
    xhr.timeout = 120_000; // 2 minutes max

    xhr.send(formData);
  });
}

export function ReelUploadProvider({ children }: { children: React.ReactNode }) {
  const [job, setJob] = useState<ReelUploadJob | null>(null);

  const startUpload = useCallback(async (payload: ReelUploadPayload) => {
    const id = `reel-${Date.now()}`;
    setJob({ id, progress: 0, label: 'Preparing video…', status: 'uploading' });

    try {
      /* ── Combine clips into one blob with correct type ── */
      const actualType = payload.clips[0]?.type || 'video/webm';
      const ext = actualType.includes('mp4') ? 'mp4' : 'webm';
      const combined = new Blob(payload.clips, { type: actualType });
      const videoFile = new File([combined], `reel_${Date.now()}.${ext}`, { type: actualType });

      /* ── Build FormData ── */
      const formData = new FormData();
      formData.append('video', videoFile);

      if (payload.coverBlob) {
        const coverFile = new File([payload.coverBlob], `cover_${Date.now()}.jpg`, { type: 'image/jpeg' });
        formData.append('cover', coverFile);
      }

      formData.append('meta', JSON.stringify({
        userId: payload.userId,
        username: payload.username,
        caption: payload.caption,
        totalDuration: payload.totalDuration,
        effect: payload.effect,
        visibility: payload.visibility,
        allowComments: payload.allowComments,
        allowDuet: payload.allowDuet,
        allowDownloads: payload.allowDownloads,
        selectedSound: payload.selectedSound,
      }));

      setJob(j => j ? { ...j, progress: 5, label: 'Uploading video…' } : j);

      /* ── Upload via XHR with real progress ── */
      const result = await xhrUpload(formData, (pct) => {
        setJob(j => j ? { ...j, progress: pct, label: `Uploading… ${pct}%` } : j);
      });

      if (!result.ok) throw new Error(result.error);

      setJob(j => j ? { ...j, progress: 95, label: 'Publishing…' } : j);
      await new Promise(r => setTimeout(r, 400));

      setJob(j => j ? { ...j, progress: 100, label: 'Posted!', status: 'done' } : j);
      setTimeout(() => setJob(null), 4000);

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed. Tap to dismiss.';
      setJob(j => j ? { ...j, status: 'error', error: msg, label: 'Upload failed' } : j);
    }
  }, []);

  const dismissJob = useCallback(() => setJob(null), []);

  return <Ctx.Provider value={{ job, startUpload, dismissJob }}>{children}</Ctx.Provider>;
}

export const useReelUpload = () => useContext(Ctx);
