'use client';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { storage, databases, ID, DATABASE_ID, COL, BUCKET } from '@/lib/appwrite';

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
    setJob({ id, progress: 0, label: 'Starting…', status: 'uploading' });

    try {
      setJob(j => j ? { ...j, progress: 10, label: 'Preparing video…' } : j);
      await new Promise(r => setTimeout(r, 100));

      const combined = new Blob(payload.clips, { type: payload.clips[0]?.type || 'video/webm' });
      const videoFile = new File([combined], `reel_${Date.now()}.mp4`, { type: 'video/mp4' });

      setJob(j => j ? { ...j, progress: 20, label: 'Uploading video…' } : j);
      const uploaded = await storage.createFile(BUCKET.REEL_MEDIA, ID.unique(), videoFile);

      setJob(j => j ? { ...j, progress: 65, label: 'Saving cover…' } : j);
      let coverFileId: string | null = null;
      if (payload.coverBlob) {
        try {
          const coverFile = new File([payload.coverBlob], `cover_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const coverUploaded = await storage.createFile(BUCKET.REEL_MEDIA, ID.unique(), coverFile);
          coverFileId = coverUploaded.$id;
        } catch { /* non-critical */ }
      }

      setJob(j => j ? { ...j, progress: 80, label: 'Publishing…' } : j);
      const docData: Record<string, unknown> = {
        user_id: payload.userId,
        username: payload.username,
        content: payload.caption.trim(),
        type: 'reel',
        media_url: uploaded.$id,
        duration: payload.totalDuration,
        effects_applied: payload.effect !== 'none' ? [payload.effect] : [],
        is_draft: false,
        visibility: payload.visibility,
        allow_comments: payload.allowComments,
        allow_duet: payload.allowDuet,
        allow_downloads: payload.allowDownloads,
        likes_count: 0,
        unlikes_count: 0,
        comments_count: 0,
        shares_count: 0,
        views_count: 0,
      };
      if (coverFileId) docData.reel_cover_file_id = coverFileId;
      if (payload.selectedSound) {
        docData.sound_id = payload.selectedSound.id;
        docData.sound_title = payload.selectedSound.title;
        docData.sound_artist = payload.selectedSound.artist;
        docData.sound_start_time = payload.selectedSound.startTime;
      }

      await databases.createDocument(DATABASE_ID, COL.POSTS, ID.unique(), docData);
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
