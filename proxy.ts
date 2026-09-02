import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Standard @supabase/ssr Next.js middleware: refreshes the auth session
// cookie on every request so a signed-in user's session doesn't silently
// expire mid-browsing. Doesn't block/redirect anything itself — route-level
// checks (e.g. the adult(18+) gate in app/api/xean-service/route.ts) handle
// authorization; this only keeps the session cookie valid.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Skip Supabase entirely if env vars aren't configured yet, so the app
  // doesn't hard-crash before you've finished setup.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  // This proxy runs on EVERY request (see matcher below), so it must never
  // be a single point of failure for the whole site. If Supabase is briefly
  // unreachable, or the env vars are present but malformed/wrong, fall back
  // to serving the request normally (just without a refreshed session)
  // instead of taking down every page — including the homepage — with an
  // unhandled exception.
  try {
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        }
      }
    });

    await supabase.auth.getUser();
  } catch (e) {
    console.error('[proxy] Supabase session refresh failed (non-fatal):', e);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
