import { NextRequest, NextResponse } from 'next/server';
import { getAdminDatabases, DATABASE_ID } from '@/lib/appwrite-server';
import { Query } from 'node-appwrite';
import { OAUTH_COL } from '@/lib/oauth-server';

export async function GET(req: NextRequest) {
  const user_id = req.nextUrl.searchParams.get('user_id');
  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 });

  const db = getAdminDatabases();

  try {
    const tokensRes = await db.listDocuments(DATABASE_ID, OAUTH_COL.ACCESS_TOKENS, [
      Query.equal('user_id', user_id),
      Query.equal('revoked', false),
      Query.greaterThan('expires_at', new Date().toISOString()),
      Query.orderDesc('$createdAt'),
      Query.limit(100),
    ]);

    const clientIds: string[] = [...new Set(tokensRes.documents.map((d: any) => d.client_id as string))];

    const clients: Record<string, any> = {};
    for (const cid of clientIds) {
      try {
        const cr = await db.listDocuments(DATABASE_ID, OAUTH_COL.CLIENTS, [
          Query.equal('client_id', cid),
          Query.limit(1),
        ]);
        if (cr.documents.length) clients[cid] = cr.documents[0];
      } catch {}
    }

    const grouped = clientIds.map((cid) => {
      const tokens = tokensRes.documents.filter((d: any) => d.client_id === cid);
      const latestToken = tokens[0];
      const client = clients[cid] || {};
      return {
        client_id: cid,
        name: client.name || cid,
        logo_url: client.logo_url || '',
        website_url: client.website_url || '',
        scopes: latestToken?.scopes || 'profile',
        granted_at: latestToken?.$createdAt || '',
        token_ids: tokens.map((t: any) => t.$id),
      };
    });

    return NextResponse.json({ connected: grouped });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const db = getAdminDatabases();
  try {
    const { client_id, user_id } = await req.json();
    if (!client_id || !user_id) return NextResponse.json({ error: 'client_id and user_id required' }, { status: 400 });

    const tokensRes = await db.listDocuments(DATABASE_ID, OAUTH_COL.ACCESS_TOKENS, [
      Query.equal('client_id', client_id),
      Query.equal('user_id', user_id),
      Query.limit(100),
    ]);

    await Promise.all(
      tokensRes.documents.map((d: any) =>
        db.updateDocument(DATABASE_ID, OAUTH_COL.ACCESS_TOKENS, d.$id, { revoked: true })
      )
    );

    return NextResponse.json({ ok: true, revoked: tokensRes.documents.length });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
