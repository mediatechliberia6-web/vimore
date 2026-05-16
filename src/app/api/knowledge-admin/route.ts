import { NextRequest, NextResponse } from 'next/server';

const ENDPOINT = (process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://mediatechliberia.online/v1').replace(/\/$/, '');
const PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || 'vimore123';
const DB = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || process.env.APPWRITE_DATABASE_ID || 'vimoreprod';
const COLLECTION = 'ai_knowledge_bank';

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': PROJECT,
    'X-Appwrite-Key': process.env.APPWRITE_API_KEY || '',
  };
}

export async function GET(req: NextRequest) {
  if (!process.env.APPWRITE_API_KEY) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(100, parseInt(searchParams.get('limit') || '50'));
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const res = await fetch(
      `${ENDPOINT}/databases/${DB}/collections/${COLLECTION}/documents?limit=${limit}&offset=${offset}`,
      { headers: getHeaders(), cache: 'no-store' }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || 'Fetch failed' }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!process.env.APPWRITE_API_KEY) {
    return NextResponse.json({ error: 'Not configured' }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const docId = searchParams.get('id');

  if (!docId) {
    return NextResponse.json({ error: 'id required' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `${ENDPOINT}/databases/${DB}/collections/${COLLECTION}/documents/${docId}`,
      { method: 'DELETE', headers: getHeaders() }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.message || 'Delete failed' }, { status: res.status });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
