'use client';

import { createBrowserClient } from '@supabase/ssr';

// Browser-side Supabase client (publishable/anon key only — safe to expose,
// same key your app already sends from the browser to Supabase's own API).
// RLS on `profiles`/`transactions` means this client can only ever read the
// signed-in user's own row and can't write to either table at all (see the
// migration comments in Supabase for why writes are server-only).
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
