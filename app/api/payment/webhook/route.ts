import { NextRequest, NextResponse } from 'next/server';
import { getTransaction, markTransactionStatus, upgradeTier } from '@/lib/supabase/profile-store';

// Rewritten to persist via Supabase instead of in-memory Maps.
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
    const depositId = payload?.depositId || payload?.data?.depositId;
    const status = (payload?.status || payload?.data?.status || '').toLowerCase();

    if (depositId && (status === 'success' || status === 'already')) {
      const tx = await getTransaction(depositId);
      if (tx) {
        await markTransactionStatus(depositId, 'success');
        await upgradeTier(tx.user_id, tx.tier, 30);
      }
    }

    return NextResponse.json({ success: true, received: true });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
