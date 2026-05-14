import { NextRequest, NextResponse } from 'next/server';
import { getAdminStorage, getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const COL_POSTS = 'posts';
const BUCKET_REEL = 'reel_media';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const videoFile = formData.get('video') as File | null;
    const coverFile = formData.get('cover') as File | null;
    const metaStr = formData.get('meta') as string | null;

    if (!videoFile || !metaStr) {
      return NextResponse.json({ error: 'Missing video or metadata' }, { status: 400 });
    }

    const meta = JSON.parse(metaStr);
    if (!meta.userId) {
      return NextResponse.json({ error: 'Missing userId in metadata' }, { status: 400 });
    }

    const adminStorage = getAdminStorage();
    const adminDb = getAdminDatabases();

    /* ── Upload video file ── */
    const uploaded = await adminStorage.createFile(
      BUCKET_REEL,
      ID.unique(),
      videoFile,
    );

    /* ── Upload cover image (non-critical) ── */
    let coverFileId: string | null = null;
    if (coverFile) {
      try {
        const coverUploaded = await adminStorage.createFile(
          BUCKET_REEL,
          ID.unique(),
          coverFile,
        );
        coverFileId = coverUploaded.$id;
      } catch { /* non-critical — proceed without cover */ }
    }

    /* ── Create post document ── */
    const docData: Record<string, unknown> = {
      user_id: meta.userId,
      username: meta.username || '',
      content: (meta.caption || '').trim(),
      type: 'reel',
      media_url: uploaded.$id,
      duration: meta.totalDuration || 0,
      effects_applied: meta.effect && meta.effect !== 'none' ? [meta.effect] : [],
      is_draft: false,
      visibility: meta.visibility || 'public',
      allow_comments: meta.allowComments ?? true,
      allow_duet: meta.allowDuet ?? true,
      allow_downloads: meta.allowDownloads ?? true,
      likes_count: 0,
      unlikes_count: 0,
      comments_count: 0,
      shares_count: 0,
      views_count: 0,
    };

    if (coverFileId) docData.reel_cover_file_id = coverFileId;

    if (meta.selectedSound) {
      docData.sound_id = meta.selectedSound.id;
      docData.sound_title = meta.selectedSound.title;
      docData.sound_artist = meta.selectedSound.artist;
      docData.sound_start_time = meta.selectedSound.startTime;
    }

    await adminDb.createDocument(DATABASE_ID, COL_POSTS, ID.unique(), docData);

    return NextResponse.json({ ok: true, fileId: uploaded.$id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    console.error('[/api/upload/reel]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
