import { NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { ID } from 'node-appwrite';

export async function GET() {
  const out: Record<string, any> = {
    keyPresent: !!process.env.APPWRITE_API_KEY,
    keyLen: (process.env.APPWRITE_API_KEY || '').length,
    endpointPresent: !!process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectPresent: !!process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: DATABASE_ID,
  };

  const db = getAdminDatabases();

  let createdId: string | null = null;
  try {
    const doc: any = await db.createDocument(DATABASE_ID, 'friend_requests', ID.unique(), {
      from_user_id: '__diag_from__',
      to_user_id: '__diag_to__',
      status: 'PENDING',
    });
    createdId = doc.$id;
    out.write = { ok: true, id: createdId };
  } catch (e: any) {
    out.write = { ok: false, code: e?.code, type: e?.type, message: e?.message };
  }

  if (createdId) {
    try {
      await db.deleteDocument(DATABASE_ID, 'friend_requests', createdId);
      out.cleanup = { ok: true };
    } catch (e: any) {
      out.cleanup = { ok: false, code: e?.code, type: e?.type, message: e?.message };
    }
  }

  return NextResponse.json(out);
}
