import { NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';

export async function GET() {
  const db = getAdminDatabases();
  const results: Record<string, any> = { databaseId: DATABASE_ID };

  const collections = ['tracks', 'albums', 'playlists'];
  for (const col of collections) {
    try {
      const res = await db.listDocuments(DATABASE_ID, col, [Query.limit(3)]);
      results[col] = { ok: true, total: res.total, sample: res.documents.map((d: any) => d.$id) };
    } catch (err: any) {
      results[col] = { ok: false, error: err.message, code: err.code };
    }
  }

  return NextResponse.json(results);
}
