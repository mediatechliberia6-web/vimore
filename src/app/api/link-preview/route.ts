import { NextRequest, NextResponse } from 'next/server';
import { getLinkPreview } from 'link-preview-js';

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  try {
    const data = await getLinkPreview(url, {
      timeout: 8000,
      followRedirects: 'follow',
      handleRedirects: (baseURL: string, forwardedURL: string) => {
        const urlObj = new URL(baseURL);
        const forwardedURLObj = new URL(forwardedURL);
        return (
          forwardedURLObj.hostname === urlObj.hostname ||
          forwardedURLObj.hostname.endsWith('.' + urlObj.hostname) ||
          urlObj.hostname.endsWith('.' + forwardedURLObj.hostname)
        );
      },
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; ViMoreBot/1.0)',
        'accept-language': 'en-US,en;q=0.9',
      },
    }) as any;

    const preview = {
      url: data.url || url,
      title: data.title || '',
      description: data.description || '',
      image: Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : '',
      siteName: data.siteName || new URL(url).hostname.replace('www.', ''),
      favicon: data.favicons && data.favicons.length > 0 ? data.favicons[0] : '',
    };

    return NextResponse.json(preview, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Could not fetch preview', detail: err?.message }, { status: 422 });
  }
}
