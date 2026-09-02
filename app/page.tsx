import { AppShell } from '@/components/AppShell';

// This route is the single-page app shell (tab-based navigation lives entirely
// client-side inside AppShell, mirroring the original Vite SPA's behavior).
// Rendered statically at build time; all data fetching happens client-side
// against the /api/* route handlers.
export default function Home() {
  return <AppShell />;
}
