import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { getSessionUser } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';
import { ID, Query } from 'node-appwrite';

export const maxDuration = 30;

const COL = {
  USERS: 'users',
  SUBSCRIPTIONS: 'subscriptions',
  TRANSACTIONS: 'transactions',
  NOTIFICATIONS: 'notifications',
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rl = rateLimit(`subscribe:${ip}`, 10, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to subscribe.' }, { status: 401 });
    }

    const { creatorId } = await req.json();
    if (!creatorId) {
      return NextResponse.json({ error: 'creatorId is required.' }, { status: 400 });
    }
    if (creatorId === session.userId) {
      return NextResponse.json({ error: 'Cannot subscribe to yourself.' }, { status: 400 });
    }

    const db = getAdminDatabases();

    // Check for existing active subscription (idempotent)
    const existingSubs = await db.listDocuments(DATABASE_ID, COL.SUBSCRIPTIONS, [
      Query.equal('subscriber_id', session.userId),
      Query.equal('creator_id', creatorId),
      Query.equal('status', 'ACTIVE'),
      Query.limit(1),
    ]);
    if (existingSubs.total > 0) {
      return NextResponse.json({ ok: true, alreadySubscribed: true });
    }

    // Read creator from server — includes their verified status and subscription price
    let creatorDoc: any;
    try {
      creatorDoc = await db.getDocument(DATABASE_ID, COL.USERS, creatorId);
    } catch {
      return NextResponse.json({ error: 'Creator not found.' }, { status: 404 });
    }

    // Use server-side subscription price; fall back to 5 diamonds if not set
    const cost: number = Number(creatorDoc.subscription_price ?? creatorDoc.subscriptionPrice ?? 5);
    if (cost <= 0) {
      return NextResponse.json({ error: 'Invalid subscription price.' }, { status: 400 });
    }

    // Server-side subscriber balance read
    let subscriberDoc: any;
    try {
      subscriberDoc = await db.getDocument(DATABASE_ID, COL.USERS, session.userId);
    } catch {
      return NextResponse.json({ error: 'Subscriber not found.' }, { status: 404 });
    }

    const subscriberBalance: number = Number(subscriberDoc.diamond_balance ?? 0);
    if (subscriberBalance < cost) {
      return NextResponse.json(
        { error: `Insufficient balance. You need ${cost} ◆ but have ${subscriberBalance} ◆.` },
        { status: 400 }
      );
    }

    const creatorIsVerified = creatorDoc.is_verified === true;
    const creatorShare = Math.round(cost * (creatorIsVerified ? 0.9 : 0.8) * 100) / 100;
    const platformFee = Math.round((cost - creatorShare) * 100) / 100;

    const subscriberNewBalance = parseFloat((subscriberBalance - cost).toFixed(8));
    const creatorCurrentBalance: number = Number(creatorDoc.diamond_balance ?? 0);
    const creatorNewBalance = parseFloat((creatorCurrentBalance + creatorShare).toFixed(8));

    const expiresAt = new Date(Date.now() + 30 * 86_400_000).toISOString();

    // Deduct subscriber first
    await db.updateDocument(DATABASE_ID, COL.USERS, session.userId, {
      diamond_balance: subscriberNewBalance,
    });

    try {
      await Promise.all([
        db.createDocument(DATABASE_ID, COL.SUBSCRIPTIONS, ID.unique(), {
          subscriber_id: session.userId,
          creator_id: creatorId,
          tier: 'STANDARD',
          expires_at: expiresAt,
          status: 'ACTIVE',
        }),
        db.updateDocument(DATABASE_ID, COL.USERS, creatorId, {
          diamond_balance: creatorNewBalance,
        }),
        db.createDocument(DATABASE_ID, COL.TRANSACTIONS, ID.unique(), {
          user_id: session.userId,
          type: 'SUBSCRIPTION',
          currency: 'DIAMOND',
          amount: cost,
          description: `Subscribed to @${creatorDoc.username || creatorId} — ${platformFee} ◆ platform fee`,
          reference_id: creatorId,
          status: 'COMPLETED',
        }),
        db.createDocument(DATABASE_ID, COL.TRANSACTIONS, ID.unique(), {
          user_id: creatorId,
          type: 'SUBSCRIPTION_EARNING',
          currency: 'DIAMOND',
          amount: creatorShare,
          description: `Subscription from @${subscriberDoc.username || session.userId} — ${platformFee} ◆ platform fee`,
          reference_id: session.userId,
          status: 'COMPLETED',
        }),
        db.createDocument(DATABASE_ID, COL.NOTIFICATIONS, ID.unique(), {
          user_id: creatorId,
          from_user_id: session.userId,
          type: 'SUBSCRIPTION',
          title: 'New Subscriber!',
          content: `@${subscriberDoc.username || 'Someone'} subscribed to you.`,
          message: `@${subscriberDoc.username || 'Someone'} subscribed to you.`,
          is_read: false,
        }),
      ]);
    } catch (err) {
      // Best-effort rollback
      try {
        await db.updateDocument(DATABASE_ID, COL.USERS, session.userId, {
          diamond_balance: subscriberBalance,
        });
      } catch { /* rollback failed */ }
      throw err;
    }

    return NextResponse.json({
      ok: true,
      cost,
      subscriberNewBalance,
      creatorShare,
      platformFee,
      expiresAt,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Subscription failed.' }, { status: 500 });
  }
}
