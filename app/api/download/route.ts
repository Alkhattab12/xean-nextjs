import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getProfile } from '@/lib/supabase/profile-store';
import { getEngineConfig } from '@/lib/xean-config';
import { runDownloadCascade } from '@/lib/download-engine';

// Thin wrapper around lib/download-engine.ts's runDownloadCascade(), which
// holds the actual ported business logic. This file's only job is the
// Next.js-specific plumbing: parse the request, resolve which upstream
// engine tier applies (now from the real Supabase session instead of
// client-supplied x-user-tier header, which a guest could just fake), call
// the pure function, translate its result into a NextResponse.
export const maxDuration = 300; // generous ceiling for the multi-engine fallback cascade

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { url, platform, format } = body;

  const authUser = await getAuthenticatedUser();
  const profile = authUser ? await getProfile(authUser.id) : null;
  const effectiveTier = profile?.tier || 'free';

  const defaultEngine = getEngineConfig(effectiveTier);

  const outcome = await runDownloadCascade(url, platform, format, defaultEngine);

  const { status, ...jsonBody } = outcome;
  return NextResponse.json(jsonBody, { status });
}
