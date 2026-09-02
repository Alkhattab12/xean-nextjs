import { createServerClient } from '@supabase/ssr';
import { createClient as createRawClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// Server-side Supabase client that reads/writes the user's session via
// cookies (App Router pattern from @supabase/ssr). Uses the publishable/anon
// key + RLS — i.e. it can only ever see/do what the signed-in caller is
// allowed to, exactly like a request coming straight from their browser.
// Use this for anything scoped to "the current logged-in user".
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component that can't set cookies (no-op is
            // fine — middleware.ts is what actually refreshes the session).
          }
        }
      }
    }
  );
}

// Privileged, service-role client that BYPASSES Row Level Security entirely.
// Never import this into anything that runs in the browser — it must only
// ever be used inside Route Handlers (this file has no 'use client' and
// SUPABASE_SERVICE_ROLE_KEY is intentionally not prefixed NEXT_PUBLIC_, so
// Next.js will refuse to bundle it client-side). This is what performs every
// write that a signed-in user must NOT be able to trigger themselves
// directly: quota decrement, tier upgrade after a verified payment, and
// setting age_verified_21plus (always computed server-side from a submitted
// birth year, never accepted as a raw boolean from the client).
export function createSupabaseAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. Get it from Supabase Dashboard -> Project Settings -> API -> service_role key, and add it as a server-only env var (never NEXT_PUBLIC_*).'
    );
  }
  return createRawClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

// Resolves the currently authenticated user (if any) from the request's
// Supabase session cookie. Returns null for guests — callers should fall
// back to the existing anonymous/guest quota behavior in that case, exactly
// as before. Also returns null (never throws) if Supabase itself is
// unreachable or misconfigured — every caller already treats null as "guest",
// so degrading to guest access is the correct, non-fatal fallback here
// rather than a 500 on every route that resolves identity.
export async function getAuthenticatedUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    return user;
  } catch (e) {
    console.error('[getAuthenticatedUser] Supabase unavailable, treating as guest:', e);
    return null;
  }
}
