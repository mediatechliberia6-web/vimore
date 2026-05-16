'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { storage, BUCKET, ID } from '@/lib/appwrite';

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

export function ReelUploadProvider({ children }: { children: React.ReactNode }) {
  const [job, setJob] = useState<ReelUploadJob | null>(null);

  const startUpload = useCallback(async (payload: ReelUploadPayload) => {
    const id = `reel-${Date.now()}`;
    setJob({ id, progress: 0, label: 'Preparing video…', status: 'uploading' });

    try {
      const actualType = payload.clips[0]?.type || 'video/webm';
      const ext = actualType.includes('mp4') ? 'mp4' : 'webm';
      const combined = new Blob(payload.clips, { type: actualType });
      const videoFile = new File([combined], `reel_${Date.now()}.${ext}`, { type: actualType });

      setJob(j => j ? { ...j, progress: 5, label: 'Uploading video…' } : j);

      /* ── Upload video directly to Appwrite storage with real progress ── */
      const videoFileId = ID.unique();
      await storage.createFile(
        BUCKET.REEL_MEDIA,
        videoFileId,
        videoFile,
        [],
        (progress) => {
          const pct = 5 + Math.round(progress.progress * 0.7);
          setJob(j => j ? { ...j, progress: pct, label: `Uploading… ${pct}%` } : j);
        },
      );

      /* ── Upload cover directly (non-critical) ── */
      let coverFileId: string | null = null;
      if (payload.coverBlob) {
        try {
          const coverFile = new File([payload.coverBlob], `cover_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const coverId = ID.unique();
          await storage.createFile(BUCKET.REEL_MEDIA, coverId, coverFile);
          coverFileId = coverId;
        } catch { /* non-critical */ }
      }

      setJob(j => j ? { ...j, progress: 80, label: 'Saving post…' } : j);

      /* ── Call API just to create DB record ── */
      const res = await fetch('/api/upload/reel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoFileId,
          coverFileId,
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
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || `Server error ${res.status}`);

      setJob(j => j ? { ...j, progress: 95, label: 'Publishing…' } : j);
      await new Promise(r => setTimeout(r, 400));

      setJob(j => j ? { ...j, progress: 100, label: 'Posted!', status: 'done' } : j);
      setTimeout(() => setJob(null), 4000);

    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Upload failed. Tap to dismiss.';
      setJob(j => j ? { ...j, status: 'error', error: msg, label: 'Upload failed' } : j);
      throw e;
    }
  }, []);

  const dismissJob = useCallback(() => setJob(null), []);

  return <Ctx.Provider value={{ job, startUpload, dismissJob }}>{children}</Ctx.Provider>;
}

export const useReelUpload = () => useContext(Ctx);
