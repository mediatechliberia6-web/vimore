import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { getSessionUser } from '@/lib/session';
import { rateLimit } from '@/lib/rate-limit';
import { ID } from 'node-appwrite';

export const maxDuration = 30;

const COL = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  VERIFICATION_RECORDS: 'verification_records',
};

// Minimum costs enforced server-side — cannot be bypassed by the client
const MIN_VERIFY_COST: Record<string, number> = {
  DIAMOND: 1,
  STAR: 1,
};

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    // Strict rate limit: verification is a rare, expensive action
    const rl = rateLimit(`verify:${ip}`, 5, 60_000);
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Too many requests.' }, { status: 429 });
    }

    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'You must be logged in.' }, { status: 401 });
    }

    const { currency, cost } = await req.json();
    if (!currency || !cost) {
      return NextResponse.json({ error: 'currency and cost are required.' }, { status: 400 });
    }

    const normalizedCurrency = String(currency).toUpperCase();
    if (!['DIAMOND', 'STAR'].includes(normalizedCurrency)) {
      return NextResponse.json({ error: 'currency must be DIAMOND or STAR.' }, { status: 400 });
    }

    const parsedCost = parseFloat(cost);
    const minCost = MIN_VERIFY_COST[normalizedCurrency] ?? 1;
    if (!Number.isFinite(parsedCost) || parsedCost < minCost) {
      return NextResponse.json(
        { error: `Verification requires at least ${minCost} ${normalizedCurrency}.` },
        { status: 400 }
      );
    }

    const db = getAdminDatabases();

    // Read user state server-side — never trust the client
    let userDoc: any;
    try {
      userDoc = await db.getDocument(DATABASE_ID, COL.USERS, session.userId);
    } catch {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (userDoc.is_verified === true) {
      return NextResponse.json({ ok: true, alreadyVerified: true });
    }

    const balanceField = normalizedCurrency === 'DIAMOND' ? 'diamond_balance' : 'star_balance';
    const currentBalance: number = Number(userDoc[balanceField] ?? 0);

    if (currentBalance < parsedCost) {
      return NextResponse.json(
        { error: `Insufficient balance. You need ${parsedCost} ${normalizedCurrency} but have ${currentBalance}.` },
        { status: 400 }
      );
    }

    const newBalance = parseFloat((currentBalance - parsedCost).toFixed(8));

    // Deduct balance first
    await db.updateDocument(DATABASE_ID, COL.USERS, session.userId, {
      is_verified: true,
      has_ever_been_verified: true,
      [balanceField]: newBalance,
    });

    try {
      await Promise.all([
        db.createDocument(DATABASE_ID, COL.VERIFICATION_RECORDS, ID.unique(), {
          user_id: session.userId,
          type: 'CREATOR',
          status: 'APPROVED',
        } as any),
        db.createDocument(DATABASE_ID, COL.TRANSACTIONS, ID.unique(), {
          user_id: session.userId,
          type: 'VERIFICATION_FEE',
          currency: normalizedCurrency,
          amount: parsedCost,
          description: 'Creator verification fee',
          status: 'COMPLETED',
        } as any),
      ]);
    } catch { /* non-fatal — the is_verified flag is already set */ }

    return NextResponse.json({ ok: true, newBalance });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Verification failed.' }, { status: 500 });
  }
}
