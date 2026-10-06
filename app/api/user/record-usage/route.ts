import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { incrementQuota } from '@/lib/supabase/profile-store';

// Now the authoritative gate for logged-in users: the client awaits this
// response (see recordRequestUsage() in utils/userContext.tsx) and only
// proceeds with the actual download if `allowed` is true. incrementQuota()
// uses an atomic Postgres RPC, so this stays correct even when several
// requests land concurrently (e.g. batch download processing multiple URLs
// in parallel) — no more under/over-counting.
export async function POST() {
  const authUser = await getAuthenticatedUser();

  if (authUser) {
    const result = await incrementQuota(authUser.id);
    if (result) {
      return NextResponse.json({
        success: true,
        allowed: result.allowed,
        quotaUsed: result.quota_used,
        quotaLimit: result.quota_limit,
        remaining: Math.max(0, result.quota_limit - result.quota_used)
      });
    }
    // Supabase unavailable — fail open as guest rather than blocking downloads
  }

  return NextResponse.json({ success: true, guest: true, allowed: true });
}
