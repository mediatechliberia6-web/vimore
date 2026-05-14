import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const COL_POSTS = 'posts';
const COL_USERS = 'users';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      videoFileId,
      coverFileId,
      userId,
      caption,
      totalDuration,
      effect,
      selectedSound,
    } = body;

    if (!videoFileId || !userId) {
      return NextResponse.json({ error: 'Missing videoFileId or userId' }, { status: 400 });
    }

    const adminDb = getAdminDatabases();

    /* ── Build document ── */
    const docData: Record<string, unknown> = {
      user_id: userId,
      content: (caption || '').trim(),
      type: 'reel',
      media_url: videoFileId,
      likes_count: 0,
      unlikes_count: 0,
      comments_count: 0,
      shares_count: 0,
      views_count: 0,
    };

    if (coverFileId) docData.reel_cover_file_id = coverFileId;
    if (totalDuration) docData.duration = totalDuration;
    if (effect && effect !== 'none') docData.effects_applied = [effect];
    if (selectedSound?.id) {
      docData.sound_id = selectedSound.id;
      docData.sound_title = selectedSound.title;
      docData.sound_artist = selectedSound.artist;
      docData.sound_start_time = selectedSound.startTime;
    }

    await adminDb.createDocument(DATABASE_ID, COL_POSTS, ID.unique(), docData);

    /* ── Increment posts_count on user (non-critical) ── */
    try {
      const userDoc = await adminDb.getDocument(DATABASE_ID, COL_USERS, userId);
      const currentCount = Number(userDoc.posts_count || 0);
      await adminDb.updateDocument(DATABASE_ID, COL_USERS, userId, {
        posts_count: currentCount + 1,
      });
    } catch { /* non-critical — proceed without updating count */ }

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Upload failed';
    console.error('[/api/upload/reel]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
