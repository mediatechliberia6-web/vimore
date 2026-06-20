import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { getSessionUser } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';
import { ID, Query } from 'node-appwrite';

export const maxDuration = 30;

const COL = {
  USERS: 'users',
  POSTS: 'posts',
  POST_UNLOCKS: 'post_unlocks',
  TRANSACTIONS: 'transactions',
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rl = rateLimit(`unlock-post:${ip}`, 30, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to unlock posts.' }, { status: 401 });
    }

    const { postId } = await req.json();
    if (!postId) {
      return NextResponse.json({ error: 'postId is required.' }, { status: 400 });
    }

    const db = getAdminDatabases();

    // Check for duplicate unlock (idempotent)
    const existing = await db.listDocuments(DATABASE_ID, COL.POST_UNLOCKS, [
      Query.equal('post_id', postId),
      Query.equal('user_id', session.userId),
      Query.limit(1),
    ]);
    if (existing.total > 0) {
      return NextResponse.json({ ok: true, alreadyUnlocked: true });
    }

    // Read price from the post document — never trust client-sent price
    let postDoc: any;
    try {
      postDoc = await db.getDocument(DATABASE_ID, COL.POSTS, postId);
    } catch {
      return NextResponse.json({ error: 'Post not found.' }, { status: 404 });
    }

    const cost: number = Number(postDoc.unlock_price ?? 0);
    if (cost <= 0) {
      // Post is free — just create the unlock record
      await db.createDocument(DATABASE_ID, COL.POST_UNLOCKS, ID.unique(), {
        post_id: postId,
        user_id: session.userId,
      } as any);
      return NextResponse.json({ ok: true, cost: 0, senderNewBalance: null });
    }

    const ownerId: string | null = postDoc.user_id || null;
    if (ownerId === session.userId) {
      // Owner always has access — just create the unlock record
      await db.createDocument(DATABASE_ID, COL.POST_UNLOCKS, ID.unique(), {
        post_id: postId,
        user_id: session.userId,
      } as any);
      return NextResponse.json({ ok: true, cost: 0, senderNewBalance: null });
    }

    // Server-side balance read
    let buyerDoc: any;
    try {
      buyerDoc = await db.getDocument(DATABASE_ID, COL.USERS, session.userId);
    } catch {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const buyerBalance: number = Number(buyerDoc.diamond_balance ?? 0);
    if (buyerBalance < cost) {
      return NextResponse.json(
        { error: `Insufficient balance. You need ${cost} ◆ but have ${buyerBalance} ◆.` },
        { status: 400 }
      );
    }

    // Read creator's verified status for fee split
    let ownerDoc: any = null;
    if (ownerId) {
      try { ownerDoc = await db.getDocument(DATABASE_ID, COL.USERS, ownerId); } catch { /* ignore */ }
    }
    const ownerIsVerified = ownerDoc?.is_verified === true;
    const creatorShare = Math.floor(cost * (ownerIsVerified ? 0.9 : 0.8) * 100) / 100;
    const platformFee = Math.round((cost - creatorShare) * 100) / 100;

    const buyerNewBalance = parseFloat((buyerBalance - cost).toFixed(8));

    // Deduct buyer
    await db.updateDocument(DATABASE_ID, COL.USERS, session.userId, {
      diamond_balance: buyerNewBalance,
    });

    const ops: Promise<any>[] = [
      db.createDocument(DATABASE_ID, COL.POST_UNLOCKS, ID.unique(), {
        post_id: postId,
        user_id: session.userId,
      } as any),
      db.createDocument(DATABASE_ID, COL.TRANSACTIONS, ID.unique(), {
        user_id: session.userId,
        type: 'POST_UNLOCK',
        currency: 'DIAMOND',
        amount: cost,
        description: `Post unlock — ${platformFee} ◆ platform fee`,
        reference_id: postId,
        status: 'COMPLETED',
      } as any),
    ];

    if (ownerId && ownerDoc) {
      const ownerCurrentBalance: number = Number(ownerDoc.diamond_balance ?? 0);
      const ownerNewBalance = parseFloat((ownerCurrentBalance + creatorShare).toFixed(8));
      ops.push(
        db.updateDocument(DATABASE_ID, COL.USERS, ownerId, {
          diamond_balance: ownerNewBalance,
        } as any),
        db.createDocument(DATABASE_ID, COL.TRANSACTIONS, ID.unique(), {
          user_id: ownerId,
          type: 'POST_UNLOCK_EARNING',
          currency: 'DIAMOND',
          amount: creatorShare,
          description: `Post unlock earning (${ownerIsVerified ? '90' : '80'}%) — ${platformFee} ◆ platform fee`,
          reference_id: postId,
          status: 'COMPLETED',
        } as any)
      );
    }

    try {
      await Promise.all(ops);
    } catch (err) {
      // Best-effort rollback
      try {
        await db.updateDocument(DATABASE_ID, COL.USERS, session.userId, {
          diamond_balance: buyerBalance,
        });
      } catch { /* rollback failed */ }
      throw err;
    }

    return NextResponse.json({ ok: true, cost, senderNewBalance: buyerNewBalance });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unlock failed.' }, { status: 500 });
  }
}
