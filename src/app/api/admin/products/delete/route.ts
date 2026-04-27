import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, getAdminStorage, DATABASE_ID } from '@/lib/appwrite-server';

const PRODUCTS_COLLECTION = 'Products';
const USERS_COLLECTION = 'users';
const MARKETPLACE_BUCKET = 'Marketplace_Images';

const ALLOWED_ROLES = new Set(['SUPER', 'MODERATOR']);

export async function POST(req: NextRequest) {
  try {
    const { adminUserId, productId } = await req.json();

    if (!adminUserId || !productId) {
      return NextResponse.json({ error: 'adminUserId and productId required' }, { status: 400 });
    }

    const db = getAdminDatabases();

    let adminDoc: any;
    try {
      adminDoc = await db.getDocument(DATABASE_ID, USERS_COLLECTION, adminUserId);
    } catch {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 403 });
    }
    if (!ALLOWED_ROLES.has(adminDoc?.role)) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    let product: any = null;
    try {
      product = await db.getDocument(DATABASE_ID, PRODUCTS_COLLECTION, productId);
    } catch { /* already gone */ }

    if (product) {
      const storage = getAdminStorage();
      const fileIds: string[] = Array.isArray(product.imageFileIds) ? product.imageFileIds : [];
      for (const fileId of fileIds) {
        try { await storage.deleteFile(MARKETPLACE_BUCKET, fileId); } catch { /* ignore */ }
      }
      try { await db.deleteDocument(DATABASE_ID, PRODUCTS_COLLECTION, productId); } catch { /* already gone */ }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Bad request' }, { status: 400 });
  }
}
