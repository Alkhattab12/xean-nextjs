import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { getProfile, TIER_LIMITS } from '@/lib/supabase/profile-store';

// Rewritten to resolve identity from the real Supabase session cookie
// (set by Google OAuth sign-in) instead of a client-supplied x-user-id
// header. This is what makes quota persist correctly across logout/login:
// the profile row is looked up by the stable Supabase auth user id, backed
// by real Postgres, not a per-process in-memory Map.
export async function GET() {
  const authUser = await getAuthenticatedUser();

  if (authUser) {
    const profile = await getProfile(authUser.id);
    if (profile) {
      return NextResponse.json({
        success: true,
        user: {
          id: profile.id,
          name: profile.name || profile.email.split('@')[0],
          email: profile.email,
          avatar: authUser.user_metadata?.avatar_url,
          tier: profile.tier,
          quotaUsed: profile.quota_used,
          quotaLimit: profile.quota_limit,
          tierExpiresAt: profile.tier_expires_at ? new Date(profile.tier_expires_at).getTime() : undefined,
          createdAt: new Date(profile.created_at).getTime(),
          ageVerified21Plus: profile.age_verified_21plus
        }
      });
    }
  }

  return NextResponse.json({
    success: true,
    user: null,
    guestQuotaUsed: 0,
    guestQuotaLimit: TIER_LIMITS.free
  });
}
