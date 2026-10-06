import { NextRequest, NextResponse } from 'next/server';
import { getTransaction, markTransactionStatus, upgradeTier, getProfile } from '@/lib/supabase/profile-store';
import { RAMASHOP_API_BASE, RAMASHOP_API_KEY } from '@/lib/xean-config';

// Rewritten to persist via Supabase (lib/supabase/profile-store.ts) instead
// of in-memory Maps. Same strict rule as the original: only activate on an
// explicit "success"/"already" status from RamaShop's own gateway — never
// optimistically on "pending".
export async function GET(req: NextRequest, { params }: { params: Promise<{ depositId: string }> }) {
  const { depositId } = await params;
  if (!depositId) {
    return NextResponse.json({ success: false, error: 'Deposit ID diperlukan.' }, { status: 400 });
  }

  const tx = await getTransaction(depositId);

  try {
    const ramaRes = await fetch(`${RAMASHOP_API_BASE}/deposit/status/${depositId}`, {
      headers: { 'X-API-Key': RAMASHOP_API_KEY }
    });

    const ramaData = await ramaRes.json();

    if (!ramaData.success || !ramaData.data) {
      return NextResponse.json(
        { success: false, error: ramaData.message || 'Data transaksi tidak ditemukan di Payment Gateway.' },
        { status: 404 }
      );
    }

    const gatewayStatus = (ramaData.data.status || 'pending').toLowerCase();

    if (gatewayStatus === 'success' || gatewayStatus === 'already') {
      let profile = null;
      const targetTier = tx?.tier || 'vip';

      if (tx) {
        await markTransactionStatus(depositId, 'success');
        profile = await upgradeTier(tx.user_id, targetTier, 30);
      }

      return NextResponse.json({
        success: true,
        paid: true,
        status: 'success',
        message: `✅ Pembayaran berhasil diverifikasi oleh RamaShop! Paket ${targetTier.toUpperCase()} Anda telah aktif.`,
        user: profile,
        depositId,
        totalAmount: ramaData.data.totalAmount || tx?.total_amount
      });
    }

    if (gatewayStatus === 'pending') {
      return NextResponse.json({
        success: true,
        paid: false,
        status: 'pending',
        message: '⏳ Menunggu pembayaran. Pembayaran belum terdeteksi di mutasi QRIS RamaShop. Silakan transfer sesuai total nominal unik.',
        depositId,
        totalAmount: ramaData.data.totalAmount || tx?.total_amount
      });
    }

    if (tx) {
      await markTransactionStatus(depositId, gatewayStatus as any);
    }

    return NextResponse.json({
      success: false,
      paid: false,
      status: gatewayStatus,
      message: `Tagihan QRIS ${gatewayStatus === 'expired' ? 'telah kadaluarsa' : 'dibatalkan'}. Silakan buat tagihan baru.`,
      depositId
    });
  } catch (error: any) {
    console.error('Check status error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal mengecek status pembayaran ke server RamaShop.' },
      { status: 500 }
    );
  }
}
