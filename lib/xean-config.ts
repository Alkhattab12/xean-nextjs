// Ported verbatim from the original Express server.ts (lines ~20-195): secret
// upstream API configuration, the Haidar key-rotation pool, and the
// sanitizeData() re-branding helper. None of this business logic changed —
// only its home (a standalone lib module instead of inline in server.ts) and
// the fact that secrets now come exclusively from process.env, with the
// original hardcoded values kept only as local-dev fallbacks (see note below).

// Secret Upstream Configuration (server-only — this file is never imported
// by a 'use client' component, so none of this reaches the browser bundle)
export const HAIDAR_API_BASE = 'https://api.haidarxd.my.id';

// Multi-Key Rotating Pool for Haidar API to guarantee continuous uptime.
// NOTE: the original hardcoded 4 fallback keys directly in source alongside
// the env-configured one. They're kept here for 1:1 behavioral parity (so
// the app works immediately after a fresh `git clone` + `vercel deploy`
// without forcing an env var first), but for a real production deployment
// you should treat HAIDAR_API_KEY in your Vercel env vars as the only key
// that matters and rotate/revoke the hardcoded ones with the provider if
// they're not meant to be public.
export const HAIDAR_KEY_POOL = [
  'haidarapis-6f25844cbe964f1857decc71',
  'haidarapis-2192103b957c645fefaf4687',
  'haidarapis-68f92a643b3dfc666d98a14e',
  'haidarapis-8a4b75fbdf62dc48639712ea',
  process.env.HAIDAR_API_KEY || 'haidarapis-6f25844cbe964f1857decc71'
].filter((k, idx, arr) => Boolean(k) && arr.indexOf(k) === idx);

// NOTE (Vercel adaptation): the original used a single module-level
// `currentHaidarKeyIdx` variable, which works on a long-lived Express
// process but only persists for the lifetime of one warm serverless
// instance here (see lib/store.ts for the full explanation of this
// pattern). Rotation still works correctly within a request/cascade — it
// just doesn't "remember" the rotation permanently across cold starts,
// which is harmless: it only means occasionally retrying key #1 first
// instead of resuming from whichever key was last active.
const globalForKeyPool = globalThis as unknown as { __xeanHaidarKeyIdx?: number };
if (globalForKeyPool.__xeanHaidarKeyIdx === undefined) {
  globalForKeyPool.__xeanHaidarKeyIdx = 0;
}

export function getActiveHaidarKey(): string {
  return HAIDAR_KEY_POOL[globalForKeyPool.__xeanHaidarKeyIdx! % HAIDAR_KEY_POOL.length];
}

export function rotateHaidarKey(): string {
  globalForKeyPool.__xeanHaidarKeyIdx = (globalForKeyPool.__xeanHaidarKeyIdx! + 1) % HAIDAR_KEY_POOL.length;
  const nextKey = getActiveHaidarKey();
  console.log(`[Key Pool] Rotated Haidar API key to index ${globalForKeyPool.__xeanHaidarKeyIdx}: ${nextKey.slice(0, 15)}...`);
  return nextKey;
}

export const AUTORESBOT_API_BASE = 'https://api.autoresbot.com';
export const AUTORESBOT_API_KEY = process.env.AUTORESBOT_API_KEY || 'xeanapikeyautoresbot2026';

// Ramashop Payment Gateway Configuration
export const RAMASHOP_API_BASE = process.env.RAMASHOP_API_BASE || 'https://ramashop.my.id/api/public';
export const RAMASHOP_API_KEY = process.env.RAMASHOP_API_KEY || 'rg_beca4972517f0e334b65f9d12e19af';

// NOTE: TIER_LIMITS lives in lib/store.ts, not here — it's a user/quota
// concept, kept alongside userStore so there's exactly one source of truth
// for it. This module only deals with upstream engine selection.

export interface EngineConfig {
  baseUrl: string;
  apiKey: string;
  isVip: boolean;
  isVipPlus: boolean;
  tier: string;
}

// Resolves which upstream engine (free-tier Haidar vs VIP Autoresbot) a
// request should use, given the caller's effective tier. The original read
// this off `req.headers['x-user-tier']` (falling back to the resolved
// user's stored tier) directly inside the function; here the route handler
// resolves the tier first (via resolveUser() in lib/store.ts, which needs
// the full header set) and passes just the tier string in, keeping this
// function a pure, easily-testable mapping.
export function getEngineConfig(tier: string): EngineConfig {
  const explicitTier = (tier || 'free').toLowerCase();
  const isVipPlus = explicitTier === 'vip_plus';
  const isVip = explicitTier === 'vip' || isVipPlus;

  if (isVip) {
    return {
      baseUrl: AUTORESBOT_API_BASE,
      apiKey: AUTORESBOT_API_KEY,
      isVip: true,
      isVipPlus,
      tier: explicitTier
    };
  }

  return {
    baseUrl: HAIDAR_API_BASE,
    apiKey: getActiveHaidarKey(),
    isVip: false,
    isVipPlus: false,
    tier: 'free'
  };
}

// Helper: Sanitize third-party metadata and re-brand to Xean Digital
// (verbatim from the original — every replacement pattern preserved exactly)
export function sanitizeData(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return obj
      .replace(/https?:\/\/api\.haidarxd\.my\.id[^\s"]*/gi, 'https://xeandigital.web.id')
      .replace(/https?:\/\/api\.autoresbot\.com[^\s"]*/gi, 'https://xeandigital.web.id')
      .replace(/haidarapis-[a-zA-Z0-9]+/gi, 'xean-sec-key')
      .replace(/xeanapikeyautoresbot[a-zA-Z0-9]*/gi, 'xean-vip-engine')
      .replace(/autoresbot/gi, 'Xean VIP Engine')
      .replace(/haidarmahiru/gi, 'Syamil Alkhattab (Xean Digital)')
      .replace(/haidarapis/gi, 'xean-digital')
      .replace(/haidarxd\.my\.id/gi, 'xeandigital.web.id')
      .replace(/haidar/gi, 'Xean');
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeData);
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey === 'author' || lowerKey === 'creator' || lowerKey === 'apicreator') {
        cleaned[key] = 'Xean Digital - Syamil Alkhattab';
      } else if (lowerKey === 'powered_by' || lowerKey === 'source_api' || lowerKey === 'source') {
        cleaned[key] = 'Xean Digital Engine v2.5';
      } else {
        cleaned[key] = sanitizeData(val);
      }
    }
    return cleaned;
  }
  return obj;
}
