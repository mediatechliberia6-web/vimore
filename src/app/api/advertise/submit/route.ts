import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

export const maxDuration = 30;

const USERS_COL = 'users';
const CAMPAIGNS_COL = 'ad_campaigns';
const DIAMONDS_PER_DAY = 3;
const MIN_DAYS = 5;
const MAX_DAYS = 90;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userId,
      businessName,
      details,
      actionUrl,
      actionLabel,
      placement,
      days,
      mediaUrl,
      mediaId,
      contactType,
    } = body;

    if (!userId || !businessName || !details || !actionUrl || !actionLabel || !placement || !days || !mediaUrl || !mediaId) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const parsedDays = Number(days);
    if (!Number.isInteger(parsedDays) || parsedDays < MIN_DAYS || parsedDays > MAX_DAYS) {
      return NextResponse.json({ error: `Campaign duration must be between ${MIN_DAYS} and ${MAX_DAYS} days.` }, { status: 400 });
    }

    if (!['feed', 'reel'].includes(placement)) {
      return NextResponse.json({ error: 'Placement must be feed or reel.' }, { status: 400 });
    }

    const db = getAdminDatabases();
    const totalCost = parsedDays * DIAMONDS_PER_DAY;

    let userDoc: any;
    try {
      userDoc = await db.getDocument(DATABASE_ID, USERS_COL, userId);
    } catch {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const realBalance: number = userDoc.diamond_balance ?? 0;

    if (realBalance < totalCost) {
      return NextResponse.json({
        error: 'INSUFFICIENT_BALANCE',
        message: `Insufficient Balance. This campaign costs ${totalCost} 💎 (${parsedDays} days × ${DIAMONDS_PER_DAY} 💎/day). Your actual balance is ${realBalance} 💎. You are short by ${totalCost - realBalance} 💎.`,
        needed: totalCost,
        current: realBalance,
        shortfall: totalCost - realBalance,
      }, { status: 402 });
    }

    const newBalance = realBalance - totalCost;
    await db.updateDocument(DATABASE_ID, USERS_COL, userId, {
      diamond_balance: newBalance,
    });

    const expires = new Date();
    expires.setDate(expires.getDate() + parsedDays);

    let campaignDoc: any;
    try {
      campaignDoc = await db.createDocument(DATABASE_ID, CAMPAIGNS_COL, ID.unique(), {
        user_id: userId,
        title: String(businessName).trim(),
        content: String(details).trim(),
        media_url: String(mediaUrl),
        media_id: String(mediaId),
        placement: String(placement),
        type: 'video',
        status: 'ACTIVE',
        is_active: true,
        impressions: 0,
        clicks: 0,
        action_url: String(actionUrl),
        action_label: String(actionLabel).trim(),
        budget: totalCost,
        spent: totalCost,
        expires_at: expires.toISOString(),
        contact_type: String(contactType || 'url'),
        days_purchased: parsedDays,
        diamonds_spent: totalCost,
      });
    } catch (campaignErr: any) {
      try {
        await db.updateDocument(DATABASE_ID, USERS_COL, userId, { diamond_balance: realBalance });
      } catch { /* best-effort refund */ }
      return NextResponse.json({ error: `Campaign creation failed: ${campaignErr?.message || 'unknown error'}. Your Diamonds have been refunded.` }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      campaign: campaignDoc,
      newBalance,
      totalCost,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal server error.' }, { status: 500 });
  }
}
