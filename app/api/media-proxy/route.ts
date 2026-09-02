import { NextRequest, NextResponse } from 'next/server';

// Ported from server.ts's `app.get('/api/media-proxy', ...)`. The streaming
// mechanism is different from the original (which piped a Node Readable
// stream converted via `Readable.fromWeb`), but the important part —
// forwarding the upstream ReadableStream straight through as the response
// body, never buffering it into memory first — is preserved and is actually
// simpler here: a Next.js Route Handler's Response accepts a ReadableStream
// body natively. This matters concretely on Vercel: Vercel Functions cap
// a *buffered* response body at 4.5MB, but Vercel's own docs confirm
// streaming responses are exempt from that cap — which is required for this
// route, since it regularly proxies video files well over 4.5MB.
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const mediaUrl = req.nextUrl.searchParams.get('url') || '';
  const isInline = req.nextUrl.searchParams.get('inline') === 'true';
  const rawFilename = req.nextUrl.searchParams.get('filename') || 'download.mp4';
  const cleanFilename = rawFilename.replace(/[/\\?%*:|"<>]/g, '_').trim() || 'download.mp4';

  if (!mediaUrl) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    let originHost = 'https://www.google.com';
    try {
      if (mediaUrl.startsWith('http')) {
        originHost = new URL(mediaUrl).origin;
      }
    } catch {}

    const fetchResponse = await fetch(mediaUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: originHost,
        Accept: '*/*'
      }
    });

    clearTimeout(timeoutId);

    if (!fetchResponse.ok) {
      // Fallback: If upstream status is not 2xx, redirect client directly
      return NextResponse.redirect(mediaUrl, 302);
    }

    let contentType = fetchResponse.headers.get('content-type') || '';
    const contentLength = fetchResponse.headers.get('content-length');

    if (!contentType || contentType.includes('application/octet-stream')) {
      if (cleanFilename.endsWith('.mp3')) contentType = 'audio/mpeg';
      else if (cleanFilename.endsWith('.mp4')) contentType = 'video/mp4';
      else if (cleanFilename.endsWith('.jpg') || cleanFilename.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (cleanFilename.endsWith('.png')) contentType = 'image/png';
      else if (cleanFilename.endsWith('.webp')) contentType = 'image/webp';
      else contentType = 'application/octet-stream';
    }

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Access-Control-Allow-Origin', '*');
    if (contentLength) headers.set('Content-Length', contentLength);
    if (isInline) {
      headers.set('Content-Disposition', 'inline');
    } else {
      headers.set(
        'Content-Disposition',
        `attachment; filename="${cleanFilename.replace(/[^a-zA-Z0-9._-]/g, '_')}"; filename*=UTF-8''${encodeURIComponent(cleanFilename)}`
      );
    }
    headers.set('Cache-Control', 'public, max-age=86400');

    if (fetchResponse.body) {
      // Direct stream pass-through without loading the entire file in memory
      return new NextResponse(fetchResponse.body, { status: 200, headers });
    } else {
      const arrayBuffer = await fetchResponse.arrayBuffer();
      return new NextResponse(arrayBuffer, { status: 200, headers });
    }
  } catch (error: any) {
    console.warn('Media proxy fetch warning, fallback to direct redirect:', error.message);
    // If upstream connect timeout or fetch failed, seamlessly redirect client to mediaUrl
    return NextResponse.redirect(mediaUrl, 302);
  }
}
