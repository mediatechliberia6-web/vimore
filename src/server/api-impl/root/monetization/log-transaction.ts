import { NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

const TRANSACTIONS = 'transactions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const db = getAdminDatabases();
    const document = {
      transactionId: body?.transactionId || ID.unique(),
      senderUserId: body?.senderUserId,
      receiverUserId: body?.receiverUserId,
      transactionType: body?.transactionType,
      amountLD: Number(body?.amountLD ?? 0),
      itemId: body?.itemId || null,
      itemType: body?.itemType || null,
      orangeMoneyRef: body?.orangeMoneyRef || null,
      status: body?.status || 'pending',
      createdAt: new Date().toISOString(),
    };

    if (!document.senderUserId || !document.receiverUserId || !document.transactionType || !document.amountLD) {
      return NextResponse.json({ error: 'senderUserId, receiverUserId, transactionType, and amountLD are required.' }, { status: 400 });
    }

    const created = await db.createDocument(DATABASE_ID, TRANSACTIONS, document.transactionId, document);
    return NextResponse.json({ ok: true, transaction: created });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not log transaction.' }, { status: 500 });
  }
}
