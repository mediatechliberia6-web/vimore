import { NextRequest, NextResponse } from 'next/server';
import { createOAuthClient, listOAuthClients, deleteOAuthClient } from '@/lib/oauth-server';

export async function GET(req: NextRequest) {
  const owner_id = req.nextUrl.searchParams.get('owner_id');
  if (!owner_id) return NextResponse.json({ error: 'owner_id required' }, { status: 400 });
  const clients = await listOAuthClients(owner_id);
  const safe = clients.map((c: any) => ({
    $id: c.$id,
    client_id: c.client_id,
    name: c.name,
    description: c.description,
    logo_url: c.logo_url,
    website_url: c.website_url,
    redirect_uris: c.redirect_uris,
    created_at: c.created_at,
  }));
  return NextResponse.json({ clients: safe });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, logo_url, website_url, redirect_uris, owner_id } = body;
    if (!name || !redirect_uris?.length || !owner_id) {
      return NextResponse.json({ error: 'name, redirect_uris, and owner_id are required' }, { status: 400 });
    }
    const result = await createOAuthClient({ name, description, logo_url, website_url, redirect_uris, owner_id });
    return NextResponse.json(result, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { doc_id, owner_id } = await req.json();
    if (!doc_id || !owner_id) return NextResponse.json({ error: 'doc_id and owner_id required' }, { status: 400 });
    await deleteOAuthClient(doc_id, owner_id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
