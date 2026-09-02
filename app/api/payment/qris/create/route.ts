import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { createTransaction } from '@/lib/supabase/profile-store';
import { RAMASHOP_API_BASE, RAMASHOP_API_KEY } from '@/lib/xean-config';

// Rewritten to require a real signed-in Supabase session — a VIP purchase
// must be tied to a persistent account (that's the whole point), so guests
// are asked to sign in with Google first instead of an ad-hoc email/name
// pair like the original.
export async function POST(req: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser();
    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Silakan login dengan Google terlebih dahulu untuk upgrade paket.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { tier } = body;

    if (tier !== 'vip' && tier !== 'vip_plus') {
      return NextResponse.json({ success: false, error: 'Paket langganan tidak valid.' }, { status: 400 });
    }

    const baseAmount = tier === 'vip_plus' ? 10000 : 5000;
    const planName = tier === 'vip_plus' ? 'VIP+ Plan (1.000 Req/Hari)' : 'VIP Plan (500 Req/Hari)';

    // Call Ramashop Public API: POST /deposit/create
    const ramaRes = await fetch(`${RAMASHOP_API_BASE}/deposit/create`, {
      method: 'POST',
      headers: {
        'X-API-Key': RAMASHOP_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount: baseAmount, method: 'qris' })
    });

    const ramaData = await ramaRes.json();

    if (!ramaData.success || !ramaData.data) {
      console.error('Ramashop create deposit failed:', ramaData);
      return NextResponse.json(
        { success: false, error: ramaData.message || 'Gagal membuat tagihan QRIS ke Payment Gateway RamaShop.' },
        { status: 500 }
      );
    }

    const deposit = ramaData.data;
    const depositId = deposit.depositId;
    const totalAmount = deposit.totalAmount || deposit.amount;
    const uniqueCode = deposit.uniqueCode || totalAmount - baseAmount;
    const qrImage = deposit.qrImage;
    const qrString = deposit.qrString;
    const expiredAt = deposit.expiredAt || new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await createTransaction({
      deposit_id: depositId,
      user_id: authUser.id,
      user_email: authUser.email || '',
      tier,
      plan_name: planName,
      amount: baseAmount,
      total_amount: totalAmount,
      unique_code: uniqueCode,
      fee: deposit.fee || 0,
      qr_image: qrImage,
      qr_string: qrString,
      status: 'pending',
      expired_at: expiredAt
    });

    return NextResponse.json({
      success: true,
      message: ramaData.message || 'Tagihan QRIS berhasil dibuat.',
      invoice: {
        depositId,
        amount: baseAmount,
        uniqueCode,
        totalAmount,
        fee: deposit.fee || 0,
        qrImage,
        qrString,
        status: 'pending',
        expiredAt,
        planId: tier,
        planName,
        createdAt: Date.now()
      }
    });
  } catch (error: any) {
    console.error('Create QRIS error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Terjadi kesalahan sistem saat menghubungi gateway QRIS.' },
      { status: 500 }
    );
  }
}
