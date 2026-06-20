import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { getSessionUser } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';
import { ID } from 'node-appwrite';

export const maxDuration = 30;

const COL = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  NOTIFICATIONS: 'notifications',
};

// diamond_balance is an INTEGER field in Appwrite — minimum gift is 1 whole Diamond
const MIN_GIFT = 1;
const MAX_GIFT = 100_000;

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const rl = rateLimit(`gift:${ip}`, 20, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many gift requests. Slow down.' }, { status: 429 });
    }

    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in to send gifts.' }, { status: 401 });
    }

    const { recipientId, amount } = await req.json();
    if (!recipientId || !amount) {
      return NextResponse.json({ error: 'recipientId and amount are required.' }, { status: 400 });
    }
    if (recipientId === session.userId) {
      return NextResponse.json({ error: 'Cannot gift yourself.' }, { status: 400 });
    }

    // Parse as integer — diamond_balance is an integer field
    const cost = Math.round(Number(amount));
    if (!Number.isFinite(cost) || cost < MIN_GIFT || cost > MAX_GIFT) {
      return NextResponse.json({ error: `Gift amount must be between ${MIN_GIFT} and ${MAX_GIFT} Diamonds.` }, { status: 400 });
    }

    const db = getAdminDatabases();

    // Server-side balance read — never trust the client
    let senderDoc: any;
    try {
      senderDoc = await db.getDocument(DATABASE_ID, COL.USERS, session.userId);
    } catch {
      return NextResponse.json({ error: 'Sender not found.' }, { status: 404 });
    }

    const senderBalance: number = Math.round(Number(senderDoc.diamond_balance ?? 0));
    if (senderBalance < cost) {
      return NextResponse.json(
        { error: `Insufficient balance. You have ${senderBalance} ◆ but tried to send ${cost} ◆.` },
        { status: 400 }
      );
    }

    // Read recipient from server
    let recipientDoc: any;
    try {
      recipientDoc = await db.getDocument(DATABASE_ID, COL.USERS, recipientId);
    } catch {
      return NextResponse.json({ error: 'Recipient not found.' }, { status: 404 });
    }

    const recipientIsVerified = recipientDoc.is_verified === true;

    // Platform fee: 10% for verified creators, 20% for unverified
    // Use Math.floor so the fee is always fully taken before crediting creator
    const creatorShare = Math.floor(cost * (recipientIsVerified ? 0.90 : 0.80));
    const platformFee = cost - creatorShare;

    const senderNewBalance = senderBalance - cost;
    const recipientCurrentBalance: number = Math.round(Number(recipientDoc.diamond_balance ?? 0));
    const recipientNewBalance = recipientCurrentBalance + creatorShare;

    // Deduct sender first
    await db.updateDocument(DATABASE_ID, COL.USERS, session.userId, {
      diamond_balance: senderNewBalance,
    });

    try {
      await Promise.all([
        // Credit recipient with their share after platform fee
        db.updateDocument(DATABASE_ID, COL.USERS, recipientId, {
          diamond_balance: recipientNewBalance,
        }),
        // Sender transaction record
        db.createDocument(DATABASE_ID, COL.TRANSACTIONS, ID.unique(), {
          user_id: session.userId,
          type: 'GIFT_SENT',
          currency: 'DIAMOND',
          amount: cost,
          description: `Gift sent to @${recipientDoc.username || recipientId} — ${platformFee} ◆ platform fee (${recipientIsVerified ? '10' : '20'}%)`,
          reference_id: recipientId,
          status: 'COMPLETED',
        }),
        // Recipient transaction record
        db.createDocument(DATABASE_ID, COL.TRANSACTIONS, ID.unique(), {
          user_id: recipientId,
          type: 'GIFT_RECEIVED',
          currency: 'DIAMOND',
          amount: creatorShare,
          description: `Gift received from @${senderDoc.username || session.userId} — you kept ${recipientIsVerified ? '90' : '80'}% after platform fee`,
          reference_id: session.userId,
          status: 'COMPLETED',
        }),
        // Notify recipient
        db.createDocument(DATABASE_ID, COL.NOTIFICATIONS, ID.unique(), {
          user_id: recipientId,
          from_user_id: session.userId,
          type: 'GIFT',
          title: 'You received a gift!',
          content: `@${senderDoc.username || 'Someone'} sent you ${creatorShare} ◆`,
          message: `@${senderDoc.username || 'Someone'} sent you ${creatorShare} ◆`,
          is_read: false,
        }),
      ]);
    } catch (err) {
      // Best-effort rollback of sender deduction
      try {
        await db.updateDocument(DATABASE_ID, COL.USERS, session.userId, {
          diamond_balance: senderBalance,
        });
      } catch { /* rollback failed */ }
      throw err;
    }

    return NextResponse.json({
      ok: true,
      senderNewBalance,
      recipientNewBalance,
      creatorShare,
      platformFee,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Gift failed.' }, { status: 500 });
  }
}
