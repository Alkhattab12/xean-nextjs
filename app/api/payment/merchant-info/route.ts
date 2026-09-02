import { NextResponse } from 'next/server';
import { RAMASHOP_API_BASE, RAMASHOP_API_KEY } from '@/lib/xean-config';

// Ported verbatim from server.ts's `app.get('/api/payment/merchant-info', ...)`.
export async function GET() {
  try {
    const r = await fetch(`${RAMASHOP_API_BASE}/balance`, {
      headers: { 'X-API-Key': RAMASHOP_API_KEY }
    });
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
