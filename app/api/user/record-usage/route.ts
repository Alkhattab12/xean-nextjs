import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { incrementQuota } from '@/lib/supabase/profile-store';

// Rewritten to resolve identity from the Supabase session cookie. Guests
// (no session) are still reported success:true/guest:true — the client
// tracks their quota via localStorage exactly as before, unchanged.
export async function POST() {
  const authUser = await getAuthenticatedUser();

  if (authUser) {
    const result = await incrementQuota(authUser.id);
    if (result) {
      return NextResponse.json({
        success: true,
        quotaUsed: result.quota_used,
        quotaLimit: result.quota_limit,
        remaining: Math.max(0, result.quota_limit - result.quota_used)
      });
    }
  }

  return NextResponse.json({ success: true, guest: true });
}
