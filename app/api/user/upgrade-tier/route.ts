import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { upgradeTier } from '@/lib/supabase/profile-store';

// Rewritten: only ever upgrades the AUTHENTICATED caller's own account now
// (resolved from the Supabase session, not a client-supplied userId/email in
// the body) — the original accepted an arbitrary target userId, which was a
// privilege-escalation risk if bypassSecret ever leaked. In normal operation
// this route isn't called by the frontend at all (the QRIS status-check
// route upgrades the tier directly via lib/supabase/profile-store.ts once
// RamaShop confirms payment) — it's kept only as a guarded manual/admin path.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { tier, durationDays = 30, bypassSecret } = body;
  const newTier: 'free' | 'vip' | 'vip_plus' = tier === 'vip_plus' || tier === 'vip' ? tier : 'free';

  if (newTier !== 'free' && bypassSecret !== 'xean_internal_verified_paid') {
    return NextResponse.json(
      {
        success: false,
        error: 'Aktivasi paket VIP/VIP+ memerlukan konfirmasi pembayaran QRIS yang sah melalui Payment Gateway.'
      },
      { status: 403 }
    );
  }

  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  const profile = await upgradeTier(authUser.id, newTier, durationDays);
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Gagal memperbarui paket.' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: `Paket ${newTier.toUpperCase()} berhasil disinkronisasi.`,
    user: profile
  });
}
