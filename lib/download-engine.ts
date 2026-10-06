// Ported from the original Express server.ts's `/api/download` route handler
// and its `normalizeDownloadResult` helper (Xean Digital v2.5 downloader
// engine). Business logic — the platform-detection switch, the multi-engine
// fallback cascade, the API-key rotation, and the field-normalization
// heuristics — is preserved verbatim from the original. Only the Express
// req/res plumbing was removed: this module is now a pure function that the
// app/api/download/route.ts handler calls and translates into a NextResponse.

import {
  HAIDAR_API_BASE,
  AUTORESBOT_API_BASE,
  AUTORESBOT_API_KEY,
  HAIDAR_KEY_POOL,
  getActiveHaidarKey,
  rotateHaidarKey,
  sanitizeData,
  type EngineConfig
} from './xean-config';

export interface DownloadCascadeResult {
  status: number;
  success: boolean;
  result?: any;
  cached?: boolean;
  error?: string;
  rawError?: string;
  details?: string;
  platform?: string;
}

interface EnginePlan {
  name: string;
  endpoint?: string;
  directUrl?: string;
  baseUrl?: string;
  apiKey?: string;
  method: 'GET' | 'POST';
  queryParams?: Record<string, string>;
  bodyData?: any;
}

// In-memory cache for download extractions to protect against upstream rate
// limits. NOTE (Vercel adaptation): the original used `setInterval` to sweep
// expired entries every 5 minutes — that pattern doesn't apply on Vercel
// (a serverless invocation doesn't keep a timer running between requests),
// so expiry is instead checked lazily on read/write below. The cache itself
// is a plain module-level Map, which — same caveat as lib/store.ts — is only
// guaranteed to survive for the lifetime of one warm function instance, not
// globally across all instances. That's fine here: worst case is a cache
// miss (an extra upstream call), never stale/incorrect data.
interface DownloadCacheEntry {
  result: any;
  timestamp: number;
  expires: number;
}
const globalForCache = globalThis as unknown as {
  __xeanDownloadCache?: Map<string, DownloadCacheEntry>;
};
const downloadCache: Map<string, DownloadCacheEntry> =
  globalForCache.__xeanDownloadCache ?? new Map();
globalForCache.__xeanDownloadCache = downloadCache;

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

function pruneExpiredCacheEntries() {
  const now = Date.now();
  for (const [key, entry] of downloadCache.entries()) {
    if (entry.expires < now) downloadCache.delete(key);
  }
}

export async function runDownloadCascade(
  url: string,
  manualPlatform: string | undefined,
  format: string | undefined,
  defaultEngine: EngineConfig
): Promise<DownloadCascadeResult> {
  if (!url || typeof url !== 'string') {
    return { status: 400, success: false, error: 'URL link media diperlukan!' };
  }

  const cleanUrl = url.trim();

  // Auto-detect platform if not manually specified
  let platform = manualPlatform || 'auto';
  if (platform === 'auto') {
    if (/tiktok\.com|douyin\.com/i.test(cleanUrl)) platform = 'tiktok';
    else if (/instagram\.com/i.test(cleanUrl)) platform = 'instagram';
    else if (/youtube\.com|youtu\.be/i.test(cleanUrl)) platform = 'youtube';
    else if (/facebook\.com|fb\.watch/i.test(cleanUrl)) platform = 'facebook';
    else if (/twitter\.com|x\.com/i.test(cleanUrl)) platform = 'twitter';
    else if (/spotify\.com/i.test(cleanUrl)) platform = 'spotify';
    else if (/terabox\.com|1024tera\.com|teraboxapp\.com/i.test(cleanUrl)) platform = 'terabox';
    else if (/mega\.nz/i.test(cleanUrl)) platform = 'mega';
    else if (/github\.com/i.test(cleanUrl)) platform = 'github';
    else if (/drive\.google\.com/i.test(cleanUrl)) platform = 'gdrive';
    else if (/pinterest\.com|pin\.it/i.test(cleanUrl)) platform = 'pinterest';
    else if (/capcut\.com/i.test(cleanUrl)) platform = 'capcut';
    else if (/bilibili\.com|b23\.tv/i.test(cleanUrl)) platform = 'bilibili';
    else if (/soundcloud\.com/i.test(cleanUrl)) platform = 'soundcloud';
    else if (/mediafire\.com/i.test(cleanUrl)) platform = 'mediafire';
    else if (/music\.apple\.com/i.test(cleanUrl)) platform = 'applemusic';
    else if (/threads\.net/i.test(cleanUrl)) platform = 'threads';
    else if (/videy\.co/i.test(cleanUrl)) platform = 'videy';
    else if (/npmjs\.com/i.test(cleanUrl)) platform = 'npmjs';
    else platform = 'universal';
  }

  // 1. Check in-memory cache first
  pruneExpiredCacheEntries();
  const cacheKey = `${platform}:${format || 'auto'}:${cleanUrl}`;
  const cached = downloadCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return { status: 200, success: true, result: cached.result, cached: true };
  }

  try {
    // 2. Build multi-engine execution cascade plans
    const plans: EnginePlan[] = [];

    switch (platform) {
      case 'tiktok':
      case 'douyin':
        plans.push(
          { name: 'tikwm-direct', directUrl: `https://www.tikwm.com/api/?url=${encodeURIComponent(cleanUrl)}`, method: 'GET' },
          { name: 'autoresbot-tiktok', baseUrl: AUTORESBOT_API_BASE, apiKey: AUTORESBOT_API_KEY, endpoint: '/api/downloader/tiktok', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'haidar-tiktok-dl-post', endpoint: '/api/v1/downloader/tiktok-dl', method: 'POST', bodyData: { url: cleanUrl } },
          { name: 'haidar-douyin-get', endpoint: '/api/v1/downloader/douyin', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-get', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'spotify':
        plans.push(
          { name: 'autoresbot-spotify', baseUrl: AUTORESBOT_API_BASE, apiKey: AUTORESBOT_API_KEY, endpoint: '/api/downloader/spotify', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'haidar-spotify', endpoint: '/api/v1/downloader/spotify', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-spotify', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'instagram':
      case 'instagram-v2':
        plans.push(
          { name: 'autoresbot-instagram', baseUrl: AUTORESBOT_API_BASE, apiKey: AUTORESBOT_API_KEY, endpoint: '/api/downloader/instagram', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'haidar-instagram', endpoint: '/api/v1/downloader/instagram', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'haidar-instagram-v2', endpoint: '/api/v1/downloader/instagram-v2', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-ig', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'youtube':
        if (format === 'mp3') {
          plans.push(
            { name: 'haidar-yt-mp3', endpoint: '/api/v1/downloader/ytmp3', method: 'GET', queryParams: { url: cleanUrl } },
            { name: 'autoresbot-youtube', baseUrl: AUTORESBOT_API_BASE, apiKey: AUTORESBOT_API_KEY, endpoint: '/api/downloader/youtube', method: 'GET', queryParams: { q: cleanUrl } },
            { name: 'haidar-yt-dl', endpoint: '/api/v1/downloader/youtubedl', method: 'GET', queryParams: { url: cleanUrl } },
            { name: 'haidar-yt-mp4', endpoint: '/api/v1/downloader/ytmp4', method: 'GET', queryParams: { url: cleanUrl } },
            { name: 'savefrom-yt', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
          );
        } else {
          plans.push(
            { name: 'autoresbot-youtube', baseUrl: AUTORESBOT_API_BASE, apiKey: AUTORESBOT_API_KEY, endpoint: '/api/downloader/youtube', method: 'GET', queryParams: { q: cleanUrl } },
            { name: 'haidar-yt-dl', endpoint: '/api/v1/downloader/youtubedl', method: 'GET', queryParams: { url: cleanUrl } },
            { name: 'haidar-yt-mp4', endpoint: '/api/v1/downloader/ytmp4', method: 'GET', queryParams: { url: cleanUrl } },
            { name: 'savefrom-yt', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
          );
        }
        break;

      case 'facebook':
        plans.push(
          { name: 'autoresbot-fb', baseUrl: AUTORESBOT_API_BASE, apiKey: AUTORESBOT_API_KEY, endpoint: '/api/downloader/facebook', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'haidar-fb-primary', endpoint: '/api/v1/downloader/facebook', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-fb', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'twitter':
      case 'x':
        plans.push(
          { name: 'autoresbot-twitter', baseUrl: AUTORESBOT_API_BASE, apiKey: AUTORESBOT_API_KEY, endpoint: '/api/downloader/twitter', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'haidar-x-primary', endpoint: '/api/v1/downloader/x', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-x', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'capcut':
        plans.push(
          { name: 'autoresbot-capcut', baseUrl: AUTORESBOT_API_BASE, apiKey: AUTORESBOT_API_KEY, endpoint: '/api/downloader/capcut', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'haidar-capcut-post', endpoint: '/api/v1/downloader/capcut', method: 'POST', bodyData: { url: cleanUrl } },
          { name: 'savefrom-capcut', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'threads':
        plans.push(
          { name: 'autoresbot-threads', baseUrl: AUTORESBOT_API_BASE, apiKey: AUTORESBOT_API_KEY, endpoint: '/api/downloader/threads', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'haidar-threads-primary', endpoint: '/api/v1/downloader/threads', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-threads', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'pinterest':
        plans.push(
          { name: 'autoresbot-pinterest', baseUrl: AUTORESBOT_API_BASE, apiKey: AUTORESBOT_API_KEY, endpoint: '/api/downloader/pinterest', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-universal', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'soundcloud':
        plans.push(
          { name: 'autoresbot-soundcloud', baseUrl: AUTORESBOT_API_BASE, apiKey: AUTORESBOT_API_KEY, endpoint: '/api/downloader/soundcloud', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'haidar-soundcloud-primary', endpoint: '/api/v1/downloader/soundcloud', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-sc', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'bilibili':
        plans.push(
          { name: 'haidar-bilibili-primary', endpoint: '/api/v1/downloader/bilibili', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-bili', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'applemusic':
        plans.push(
          { name: 'haidar-applemusic-primary', endpoint: '/api/v1/downloader/applemusic', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-am', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'terabox':
        plans.push(
          { name: 'haidar-terabox-primary', endpoint: '/api/v1/downloader/terabox', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-terabox', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'mega':
        plans.push(
          { name: 'haidar-mega-primary', endpoint: '/api/v1/downloader/mega', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-mega', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'github':
        plans.push(
          { name: 'haidar-github-primary', endpoint: '/api/v1/downloader/github', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-gh', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'gdrive':
        plans.push(
          { name: 'haidar-gdrive-primary', endpoint: '/api/v1/downloader/gdrive', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-gd', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'mediafire':
        plans.push(
          { name: 'haidar-mediafire-primary', endpoint: '/api/v1/downloader/mediafire', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-mf', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'videy':
        plans.push(
          { name: 'haidar-videy-primary', endpoint: '/api/v1/downloader/videy', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-videy', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      case 'npmjs':
        plans.push(
          { name: 'haidar-npmjs-primary', endpoint: '/api/v1/downloader/npmjs', method: 'GET', queryParams: { url: cleanUrl } },
          { name: 'savefrom-npm', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;

      default:
        plans.push(
          { name: 'savefrom-universal', endpoint: '/api/v1/downloader/savefrom', method: 'GET', queryParams: { url: cleanUrl } }
        );
        break;
    }

    // 3. Execute cascading requests through candidate plans
    // (defaultEngine is resolved by the caller — see lib/xean-config.ts
    // getEngineConfig() — and passed in, since it depends on request headers
    // that belong to the route handler, not this pure cascade function)
    let lastErrorMsg = '';
    let successData: any = null;

    for (const plan of plans) {
      try {
        // Direct URL execution (e.g. TikWM)
        if (plan.directUrl) {
          const directRes = await fetch(plan.directUrl, {
            method: 'GET',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });
          if (directRes.ok) {
            const dData = await directRes.json().catch(() => null);
            if (dData && (dData.code === 0 || dData.data)) {
              successData = dData;
              break;
            }
          }
          continue;
        }

        const activeBaseUrl = plan.baseUrl || defaultEngine.baseUrl;
        let activeKey = plan.apiKey || (activeBaseUrl === HAIDAR_API_BASE ? getActiveHaidarKey() : defaultEngine.apiKey);

        // Attempt plan with automatic key rotation on rate/quota limit
        let keyAttempts = 0;
        const maxKeyAttempts = activeBaseUrl === HAIDAR_API_BASE ? HAIDAR_KEY_POOL.length : 1;

        while (keyAttempts < maxKeyAttempts) {
          const queryParams: Record<string, string> = { ...(plan.queryParams || {}), apikey: activeKey };
          if (activeBaseUrl === AUTORESBOT_API_BASE) {
            queryParams.key = activeKey;
            queryParams.api_key = activeKey;
          }

          const queryString = new URLSearchParams(queryParams).toString();
          const targetUrl = `${activeBaseUrl}${plan.endpoint}${queryString ? '?' + queryString : ''}`;
          const postBody = plan.method === 'POST' ? { ...plan.bodyData, apikey: activeKey } : undefined;

          let response = await fetch(targetUrl, {
            method: plan.method,
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            body: postBody ? JSON.stringify(postBody) : undefined
          });

          const data = await response.json().catch(() => null);
          const errCode = data?.error?.code || '';
          const errMsg = data?.error?.message || data?.message || data?.error || '';

          // If daily limit exceeded on Haidar, rotate key and retry!
          if (activeBaseUrl === HAIDAR_API_BASE && (errCode === 'daily_limit_exceeded' || /limit harian|daily_limit/i.test(errMsg))) {
            activeKey = rotateHaidarKey();
            keyAttempts++;
            continue;
          }

          // Check if response has valid extraction payload
          if (response.ok && data && data.status !== 'error' && !data.error) {
            const payload = data.result || data.data || data;
            const hasContent = 
              payload && 
              (typeof payload === 'string' ||
               payload.play || payload.video || payload.url || payload.download || payload.download_url || 
               payload.mp3 || payload.audio || payload.music || (Array.isArray(payload) && payload.length > 0) ||
               (payload.images && payload.images.length > 0) || (payload.formats && payload.formats.length > 0) ||
               payload.track);

            if (hasContent) {
              successData = data;
              break;
            }
          }

          // Record error details for fallback diagnostics
          lastErrorMsg = errMsg || `Status ${response.status}`;
          break;
        }

        if (successData) {
          break;
        }
      } catch (planErr: any) {
        console.warn(`Extraction engine "${plan.name}" encountered:`, planErr?.message || planErr);
        lastErrorMsg = planErr?.message || 'Koneksi ke engine ekstraksi terputus';
      }
    }

    // 4. If all engines failed, handle error with user-friendly Indonesian explanation
    if (!successData) {
      let friendlyError = 'Gagal memproses media dari URL tersebut. Pastikan link bersifat publik dan dapat diakses.';

      if (/rate limit|limit terlampaui|429|terlalu banyak/i.test(lastErrorMsg)) {
        friendlyError = 'Server ekstraksi sedang mengalami antrean trafik tinggi. Silakan tunggu beberapa saat (10-30 detik) dan coba lagi, atau gunakan opsi format lain.';
      } else if (/struktur web|kena limit|gagal mengekstrak/i.test(lastErrorMsg)) {
        friendlyError = 'Gagal mengekstrak konten media. Pastikan postingan/akun bersifat publik (bukan private), konten masih aktif, atau gunakan format lain.';
      } else if (lastErrorMsg && lastErrorMsg.length > 5 && lastErrorMsg.length < 150 && !/limit harian/i.test(lastErrorMsg)) {
        friendlyError = lastErrorMsg;
      }

      return { status: 400, success: false, error: friendlyError, rawError: lastErrorMsg, platform };
    }

    // 5. Normalize Download Output uniformly
    const normalized = normalizeDownloadResult(cleanUrl, platform, successData);
    const sanitized = sanitizeData(normalized);

    // 6. Store in Cache for instant re-download and rate-limit prevention
    downloadCache.set(cacheKey, {
      result: sanitized,
      timestamp: Date.now(),
      expires: Date.now() + CACHE_TTL_MS
    });

    return { status: 200, success: true, result: sanitized };
  } catch (error: any) {
    console.error('Download handler error:', error);
    return {
      status: 500,
      success: false,
      error: 'Terjadi kesalahan sistem saat memproses unduhan. Silakan coba sesaat lagi.',
      details: error.message
    };
  }
}

// ---------------------------------------------------------------------------
// Helper function to normalize various platform responses into unified schema
// (verbatim from the original server.ts)
// ---------------------------------------------------------------------------
function normalizeDownloadResult(originalUrl: string, platform: string, rawData: any): any {
  const result: any = {
    id: `xean_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    url: originalUrl,
    platform: platform,
    title: 'Xean Digital Media Download',
    author: 'Xean Creator',
    duration: '',
    thumbnail: '',
    videoUrl: '',
    type: 'video',
    downloads: [],
    images: [],
    audioUrl: '',
    caption: '',
    stats: {},
    timestamp: Date.now()
  };

  const payload = rawData.result || rawData.data || rawData;

  // 1. Universal Title Extraction
  result.title =
    payload.title ||
    payload.fulltitle ||
    payload.caption ||
    payload.desc ||
    payload.description ||
    payload.filename ||
    payload.name ||
    payload.track?.title ||
    payload.track?.name ||
    `${platform.toUpperCase()} Media Download`;

  // 2. Universal Author / Channel / Uploader Extraction
  result.author =
    payload.author?.nickname ||
    payload.author?.name ||
    payload.author?.username ||
    payload.owner ||
    payload.channel ||
    payload.uploader ||
    payload.artist ||
    payload.track?.artist ||
    (Array.isArray(payload.track?.artists) ? payload.track.artists.map((a: any) => a.name || a).join(', ') : '') ||
    'Xean Creator';

  // 3. Universal Thumbnail Extraction with High-Res Fallbacks
  let thumb =
    payload.thumbnail ||
    payload.cover ||
    payload.thumb ||
    payload.image ||
    payload.picture ||
    payload.poster ||
    payload.preview ||
    payload.display_url ||
    payload.thumbnail_url ||
    payload.origin_cover ||
    payload.dynamic_cover ||
    payload.track?.cover ||
    payload.track?.image ||
    payload.avatar ||
    '';

  if (!thumb && Array.isArray(payload.thumbnails) && payload.thumbnails.length > 0) {
    const lastThumb = payload.thumbnails[payload.thumbnails.length - 1];
    thumb = typeof lastThumb === 'string' ? lastThumb : (lastThumb.url || lastThumb.src || '');
  }

  // YouTube specific high-res thumbnail extraction if missing
  if ((!thumb || thumb.length < 5) && (platform === 'youtube' || /youtube\.com|youtu\.be/i.test(originalUrl))) {
    const ytMatch = originalUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    const ytId = ytMatch ? ytMatch[1] : (payload.id || payload.video_id || payload.display_id);
    if (ytId && ytId.length === 11) {
      thumb = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
    }
  }

  result.thumbnail = thumb;
  result.caption = payload.desc || payload.caption || payload.description || '';
  result.duration = payload.duration_formatted || payload.duration_string || (payload.duration ? `${payload.duration}s` : '');

  // 4. Collect Downloads Array
  const downloadsMap = new Map<string, any>();

  const addDownload = (opt: { label: string; quality?: string; url: string; format?: string; isAudio?: boolean; size?: string }) => {
    if (!opt.url || typeof opt.url !== 'string' || opt.url.length < 5) return;
    const cleanUrl = opt.url.trim();
    if (downloadsMap.has(cleanUrl)) return;

    downloadsMap.set(cleanUrl, {
      label: opt.label,
      quality: opt.quality || (opt.isAudio ? '320kbps' : 'HD'),
      url: cleanUrl,
      format: (opt.format || (opt.isAudio ? 'MP3' : 'MP4')).toUpperCase(),
      isAudio: opt.isAudio || false,
      size: opt.size || undefined
    });
  };

  // A. Check payload.downloads (Savefrom, Snapsave, YTMP4, FDownloader)
  if (Array.isArray(payload.downloads)) {
    payload.downloads.forEach((d: any) => {
      if (d && (d.url || typeof d === 'string')) {
        const dUrl = typeof d === 'string' ? d : d.url;
        const isAud = d.format === 'mp3' || d.audio === true || d.isAudio === true || d.ext === 'mp3';
        const qual = d.quality || d.format || d.resolution || d.label || (isAud ? 'Audio' : 'HD');
        const fmt = (d.format || d.ext || (isAud ? 'MP3' : 'MP4')).toUpperCase();
        addDownload({
          label: d.label || (isAud ? `Audio MP3 (${qual})` : `Video MP4 (${qual})`),
          quality: qual,
          url: dUrl,
          format: fmt,
          isAudio: isAud,
          size: d.size || undefined
        });
      }
    });
  }

  // B. Check payload.formats (yt-dlp / youtubedl)
  if (Array.isArray(payload.formats)) {
    payload.formats.forEach((f: any) => {
      if (f && f.url && typeof f.url === 'string') {
        const ext = (f.ext || '').toLowerCase();
        // Skip storyboard images and non-media formats
        if (ext === 'mhtml' || ext === 'jpg' || ext === 'webp' || f.format_note?.includes('storyboard') || f.protocol?.includes('mhtml')) {
          return;
        }
        const isAud = f.vcodec === 'none' || ext === 'm4a' || ext === 'mp3' || ext === 'opus' || f.format_note === 'tiny' || (f.acodec && !f.vcodec && !f.height && ext !== 'mp4');
        const qual = f.format_note || f.resolution || (f.height ? `${f.height}p` : f.quality || (isAud ? 'Audio' : '720p HD'));
        const fmt = (ext || (isAud ? 'M4A' : 'MP4')).toUpperCase();
        addDownload({
          label: isAud ? `Audio (${fmt} • ${qual})` : `Video MP4 (${qual})`,
          quality: qual,
          url: f.url,
          format: isAud ? fmt : 'MP4',
          isAudio: isAud,
          size: f.filesize ? `${(f.filesize / 1024 / 1024).toFixed(1)}MB` : undefined
        });
      }
    });
  }

  // Direct video stream URL from youtubedl or direct engines
  if (payload.url && typeof payload.url === 'string' && (payload.url.includes('googlevideo') || payload.url.includes('.mp4') || payload.format_note)) {
    const qual = payload.format_note || payload.resolution || '720p HD';
    addDownload({
      label: `Video MP4 (${qual})`,
      quality: qual,
      url: payload.url,
      format: 'MP4',
      isAudio: false
    });
  }

  // C. TikTok / Douyin specific keys
  if (payload.play || payload.video_nowm || payload.nowm || payload.hdplay) {
    const noWmUrl = payload.play || payload.video_nowm || payload.nowm || payload.hdplay;
    addDownload({
      label: 'Video MP4 HD (Tanpa Watermark)',
      quality: '1080p Full HD',
      url: noWmUrl,
      format: 'MP4',
      isAudio: false
    });
  }
  if (payload.wmplay || payload.video_wm || payload.watermark) {
    addDownload({
      label: 'Video MP4 (Watermark)',
      quality: '720p HD',
      url: payload.wmplay || payload.video_wm || payload.watermark,
      format: 'MP4',
      isAudio: false
    });
  }

  // D. Instagram / Threads / Socials Array items
  if (Array.isArray(payload)) {
    payload.forEach((item: any, idx: number) => {
      const itemUrl = typeof item === 'string' ? item : (item.url || item.download_link || item.video_url || item.image_url || item.download);
      if (itemUrl) {
        const isVideo = item.type === 'video' || itemUrl.includes('.mp4') || !itemUrl.includes('.jpg');
        addDownload({
          label: isVideo ? `Video MP4 #${idx + 1}` : `Foto HD #${idx + 1}`,
          quality: isVideo ? '1080p HD' : 'Original HQ',
          url: itemUrl,
          format: isVideo ? 'MP4' : 'JPG',
          isAudio: false
        });
      }
    });
    if (payload.length > 1) {
      result.type = 'gallery';
      result.images = payload.map((i: any) => (typeof i === 'string' ? i : (i.url || i.thumbnail || i.image_url || ''))).filter(Boolean);
    }
  }

  // E. Primary video & audio keys
  if (payload.video || payload.video_url || payload.download || payload.download_url) {
    const primVid = payload.video || payload.video_url || payload.download || payload.download_url;
    if (typeof primVid === 'string' && primVid.length > 5) {
      addDownload({
        label: 'Video MP4 HD',
        quality: payload.quality || '720p/1080p HD',
        url: primVid,
        format: 'MP4',
        isAudio: false
      });
    }
  }

  // F. Facebook SD/HD
  if (payload.hd) {
    addDownload({
      label: 'Video MP4 High Definition (HD)',
      quality: '720p/1080p HD',
      url: payload.hd,
      format: 'MP4',
      isAudio: false
    });
  }
  if (payload.sd) {
    addDownload({
      label: 'Video MP4 Standard (SD)',
      quality: '480p SD',
      url: payload.sd,
      format: 'MP4',
      isAudio: false
    });
  }

  // G. Audio streams (Spotify, SoundCloud, TikTok Audio, YouTube MP3)
  const audioStream =
    payload.audio ||
    payload.audio_url ||
    payload.mp3 ||
    payload.music ||
    payload.music_info?.url ||
    payload.track?.mp3 ||
    payload.track?.audio ||
    payload.track?.download_url;

  if (audioStream && typeof audioStream === 'string') {
    result.audioUrl = audioStream;
    addDownload({
      label: 'Audio MP3 Original (320kbps)',
      quality: '320kbps High-Bitrate',
      url: audioStream,
      format: 'MP3',
      isAudio: true
    });
  }

  // H. TikTok Gallery / Photo slideshow
  if (payload.images && Array.isArray(payload.images) && payload.images.length > 0) {
    result.type = 'gallery';
    result.images = payload.images.map((img: any) => (typeof img === 'string' ? img : img.url || img.src)).filter(Boolean);
    result.images.forEach((imgUrl: string, idx: number) => {
      addDownload({
        label: `Foto Slide #${idx + 1}`,
        quality: 'Original HQ',
        url: imgUrl,
        format: 'JPG',
        isAudio: false
      });
    });
  }

  // I. Generic direct link fallback
  if (downloadsMap.size === 0) {
    const directFallback = payload.url || payload.link || payload.direct_url;
    if (directFallback && typeof directFallback === 'string') {
      const isAud = directFallback.includes('.mp3') || platform === 'spotify' || platform === 'soundcloud';
      addDownload({
        label: isAud ? 'Audio MP3' : 'Video MP4 (Direct Stream)',
        quality: 'Original',
        url: directFallback,
        format: isAud ? 'MP3' : 'MP4',
        isAudio: isAud
      });
    }
  }

  const downloadsList = Array.from(downloadsMap.values());
  result.downloads = downloadsList;

  // Set primary video stream URL if any MP4 is found
  const firstVideo = downloadsList.find(d => !d.isAudio && (d.format === 'MP4' || d.format === 'WEBM' || d.url.includes('.mp4')));
  if (firstVideo) {
    result.videoUrl = firstVideo.url;
    result.type = 'video';
  } else if (result.audioUrl || downloadsList.some(d => d.isAudio)) {
    result.type = 'audio';
  }

  return result;
}
