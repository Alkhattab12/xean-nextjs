import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getProfile } from '@/lib/supabase/profile-store';
import {
  HAIDAR_API_BASE,
  HAIDAR_KEY_POOL,
  getActiveHaidarKey,
  rotateHaidarKey,
  getEngineConfig,
  sanitizeData
} from '@/lib/xean-config';
import { generateAiAssistantResponse } from '@/lib/ai-assistant';

// Ported from server.ts's `app.all('/api/xean-service', ...)` — the universal
// proxy that powers the 334+ tool catalog (ToolsExplorer / InteractiveToolModal).
// Business logic (key rotation, the in-house AI shortcut, error normalization,
// content-type branching) is preserved; only the Express req/res access
// patterns changed. See lib/ai-assistant.ts for why the in-house-AI branding
// changed from "Claude" to "Xean AI".
export const maxDuration = 300;

async function handler(req: NextRequest) {
  try {
    // Parse body defensively — GET/HEAD requests typically carry none, and
    // req.json() throws on an empty body, unlike Express's pre-parsed req.body.
    let body: any = {};
    try {
      const rawText = await req.text();
      if (rawText) body = JSON.parse(rawText);
    } catch {
      body = {};
    }

    const query = req.nextUrl.searchParams;
    const targetPath = query.get('path') || body?.path;
    if (!targetPath) {
      return NextResponse.json({ success: false, error: 'Layanan target tidak ditemukan' }, { status: 400 });
    }

    let cleanPath = targetPath.trim();
    if (!cleanPath.startsWith('/')) {
      cleanPath = `/${cleanPath}`;
    }
    if (!cleanPath.startsWith('/api/v1') && !cleanPath.startsWith('/api/')) {
      cleanPath = `/api/v1${cleanPath}`;
    }

    // Resolve identity once up front (used both for the adult-content gate
    // right below and for engine-tier selection further down).
    const authUser = await getAuthenticatedUser();
    const profile = authUser ? await getProfile(authUser.id) : null;

    // Adult(18+) content gate: registration + 21+ age verification required.
    // Enforced HERE server-side (not just hidden in the ToolsExplorer UI),
    // so calling the path directly can't bypass it. Matches the 26
    // `category: "adult(18+)"` entries in data/endpoints.json, all of which
    // live under this path prefix.
    if (cleanPath.startsWith('/api/v1/adult/')) {
      if (!profile) {
        return NextResponse.json(
          { success: false, error: 'Konten ini hanya tersedia untuk pengguna terdaftar. Silakan login terlebih dahulu.', requiresAuth: true },
          { status: 401 }
        );
      }
      if (!profile.age_verified_21plus) {
        return NextResponse.json(
          { success: false, error: 'Konten ini memerlukan verifikasi usia 21 tahun ke atas.', requiresAgeVerification: true },
          { status: 403 }
        );
      }
    }

    const method = req.method.toUpperCase();

    // Check if this is an in-house Xean AI assistant endpoint (renamed from
    // "claude" in the original — see lib/ai-assistant.ts)
    const isXeanAiEndpoint =
      cleanPath.includes('/ai/xean') ||
      cleanPath.includes('/ai/claude') || // legacy path kept for backward compatibility with any bookmarked/cached tool links
      (cleanPath.includes('/ai/overchat') && (query.get('model') === 'haiku' || body?.model === 'haiku'));

    if (isXeanAiEndpoint) {
      const message = query.get('message') || body?.message || query.get('prompt') || body?.prompt || query.get('text') || body?.text;
      const model = query.get('model') || body?.model || 'xean-ai-pro';
      const thinking = query.get('thinking') === 'true' || body?.thinking === 'true' || body?.thinking === true;
      const image = query.get('image') || body?.image;

      if (message) {
        try {
          const aiResult = await generateAiAssistantResponse({ message, model, thinking, image });
          return NextResponse.json(aiResult);
        } catch (aiErr: any) {
          console.error('Xean AI handler error, continuing to proxy:', aiErr);
        }
      }
    }

    // Get active engine configuration based on user tier
    const effectiveTier = profile?.tier || 'free';
    const engineConfig = getEngineConfig(effectiveTier);
    const activeBaseUrl = engineConfig.baseUrl;
    let activeApiKey = engineConfig.apiKey;

    let upstreamResponse: Response | undefined;
    let data: any = null;
    let attemptCount = 0;
    const maxAttempts = activeBaseUrl === HAIDAR_API_BASE ? HAIDAR_KEY_POOL.length : 1;

    // Build the query params once outside the loop (they don't change between
    // key-rotation retries); only apikey/key/api_key are re-appended per attempt.
    const baseQueryEntries: [string, string][] = [];
    for (const [k, v] of query.entries()) {
      if (k !== 'path' && v !== undefined && v !== '' && k !== 'apikey') {
        baseQueryEntries.push([k, v]);
      }
    }
    if (method === 'GET' && body && typeof body === 'object') {
      const existingKeys = new Set(baseQueryEntries.map(([k]) => k));
      for (const [k, v] of Object.entries(body)) {
        if (k !== 'path' && v !== undefined && v !== '' && !existingKeys.has(k)) {
          baseQueryEntries.push([k, String(v)]);
        }
      }
    }

    while (attemptCount < maxAttempts) {
      const queryParams = new URLSearchParams();
      queryParams.append('apikey', activeApiKey);
      if (engineConfig.isVip) {
        queryParams.append('key', activeApiKey);
        queryParams.append('api_key', activeApiKey);
      }
      for (const [k, v] of baseQueryEntries) {
        queryParams.append(k, v);
      }

      const fullTargetUrl = `${activeBaseUrl}${cleanPath}?${queryParams.toString()}`;

      let bodyData: string | undefined = undefined;
      const headers: Record<string, string> = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      };

      if (method === 'POST' || method === 'PUT') {
        const clonedBody = { ...(body || {}) };
        delete clonedBody.path;
        clonedBody.apikey = activeApiKey;
        if (engineConfig.isVip) {
          clonedBody.key = activeApiKey;
          clonedBody.api_key = activeApiKey;
        }
        bodyData = JSON.stringify(clonedBody);
        headers['Content-Type'] = 'application/json';
      }

      try {
        upstreamResponse = await fetch(fullTargetUrl, { method, headers, body: bodyData });
      } catch (e: any) {
        // If VIP AutoResBot fetch threw network error, fallback to Haidar
        if (engineConfig.isVip) {
          const fallbackKey = getActiveHaidarKey();
          const fbParams = new URLSearchParams();
          fbParams.append('apikey', fallbackKey);
          for (const [k, v] of baseQueryEntries) fbParams.append(k, v);
          const fbUrl = `${HAIDAR_API_BASE}${cleanPath}?${fbParams.toString()}`;
          upstreamResponse = await fetch(fbUrl, { method, headers, body: bodyData });
        } else {
          throw e;
        }
      }

      const rawContentType = upstreamResponse.headers.get('content-type') || '';
      if (rawContentType.includes('application/json')) {
        data = await upstreamResponse.json().catch(() => null);

        if (
          activeBaseUrl === HAIDAR_API_BASE &&
          (data?.error?.code === 'daily_limit_exceeded' || /limit harian|daily_limit/i.test(data?.error?.message || data?.message || ''))
        ) {
          activeApiKey = rotateHaidarKey();
          attemptCount++;
          continue;
        }
      }
      break;
    }

    const contentType = upstreamResponse?.headers?.get('content-type') || '';
    if (contentType.includes('application/json')) {
      // If upstream failed and it's an AI endpoint, fall back to the in-house Xean AI
      if (
        (!upstreamResponse!.ok || data?.error?.code === 'upstream_error' || data?.status === 'error') &&
        (cleanPath.includes('/ai/') || cleanPath.includes('/ai-image/'))
      ) {
        const msg = query.get('message') || body?.message || query.get('prompt') || body?.prompt;
        const mdl = query.get('model') || body?.model || 'xean-ai-pro';
        if (msg) {
          try {
            const fallbackResult = await generateAiAssistantResponse({
              message: msg,
              model: mdl,
              thinking: query.get('thinking') === 'true' || body?.thinking === 'true'
            });
            return NextResponse.json(fallbackResult);
          } catch (fbErr) {
            console.warn('AI fallback failed:', fbErr);
          }
        }
      }

      if (!data) {
        return NextResponse.json(
          { success: false, error: 'Respon dari server layanan tidak valid atau sedang offline.' },
          { status: upstreamResponse?.status || 500 }
        );
      }

      if (data.status === 'error' || data.error) {
        const rawMsg = data?.error?.message || data?.message || data?.error || '';
        let userMsg = rawMsg;
        if (/rate limit|limit terlampaui|429|terlalu banyak/i.test(rawMsg)) {
          userMsg = 'Server sedang mengalami antrean trafik tinggi. Silakan tunggu 10-30 detik sebelum mencoba kembali.';
        } else if (/struktur web|kena limit|gagal mengekstrak/i.test(rawMsg)) {
          userMsg = 'Gagal memproses data layanan. Pastikan input yang dimasukkan benar dan publik.';
        }
        return NextResponse.json(
          { ...sanitizeData(data), success: false, error: userMsg, friendlyMessage: userMsg },
          { status: upstreamResponse!.ok ? 200 : upstreamResponse?.status || 400 }
        );
      }

      const sanitized = sanitizeData(data);
      return NextResponse.json(sanitized, { status: upstreamResponse!.status });
    } else if (contentType.includes('image/') || contentType.includes('audio/') || contentType.includes('video/')) {
      const buffer = await upstreamResponse!.arrayBuffer();
      return new NextResponse(buffer, { status: 200, headers: { 'Content-Type': contentType } });
    } else {
      const text = await upstreamResponse!.text();
      return new NextResponse(sanitizeData(text), { status: upstreamResponse!.status });
    }
  } catch (error: any) {
    console.error('Xean service proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memproses layanan.', details: error.message },
      { status: 500 }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
