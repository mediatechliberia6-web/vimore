import { NextRequest, NextResponse } from 'next/server';

const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bucket: string; fileId: string }> }
) {
  const { bucket, fileId } = await params;

  if (!bucket || !fileId || !APPWRITE_ENDPOINT || !PROJECT_ID) {
    return new NextResponse(null, { status: 400 });
  }

  const appwriteUrl = `${APPWRITE_ENDPOINT}/storage/buckets/${encodeURIComponent(bucket)}/files/${encodeURIComponent(fileId)}/view?project=${PROJECT_ID}`;

  try {
    const cookieHeader = req.headers.get('cookie') || '';

    const upstream = await fetch(appwriteUrl, {
      headers: {
        'Cookie': cookieHeader,
        'X-Appwrite-Project': PROJECT_ID,
      },
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const buffer = await upstream.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
