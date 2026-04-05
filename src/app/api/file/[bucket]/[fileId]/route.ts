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
    const rangeHeader = req.headers.get('range');

    const upstreamHeaders: Record<string, string> = {
      'Cookie': cookieHeader,
      'X-Appwrite-Project': PROJECT_ID,
    };
    // Forward Range header so mobile audio players can stream
    if (rangeHeader) {
      upstreamHeaders['Range'] = rangeHeader;
    }

    const upstream = await fetch(appwriteUrl, {
      headers: upstreamHeaders,
      cache: 'no-store',
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new NextResponse(null, { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const contentLength = upstream.headers.get('content-length');
    const contentRange = upstream.headers.get('content-range');
    const acceptRanges = upstream.headers.get('accept-ranges') || 'bytes';

    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Accept-Ranges': acceptRanges,
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'Access-Control-Allow-Origin': '*',
    };
    if (contentLength) responseHeaders['Content-Length'] = contentLength;
    if (contentRange) responseHeaders['Content-Range'] = contentRange;

    // Stream the body directly — never buffer audio/video to avoid blocking mobile players
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
