import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/supabase/server';
import { submitAgeVerification } from '@/lib/supabase/profile-store';

// New endpoint: a logged-in user submits their birth year; age (and
// therefore whether adult(18+) tools unlock) is always computed HERE,
// server-side, never trusted as a raw boolean from the client — otherwise
// anyone could just send {ageVerified21Plus: true} directly.
export async function POST(req: NextRequest) {
  const authUser = await getAuthenticatedUser();
  if (!authUser) {
    return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu.' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const birthYear = parseInt(body?.birthYear, 10);

  if (!birthYear) {
    return NextResponse.json({ success: false, error: 'Tahun lahir wajib diisi.' }, { status: 400 });
  }

  const result = await submitAgeVerification(authUser.id, birthYear);
  if (result.error) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    isOver21: result.isOver21,
    message: result.isOver21
      ? 'Verifikasi usia berhasil. Konten 18+ kini dapat diakses.'
      : 'Verifikasi tersimpan. Sesuai kebijakan kami, konten 18+ hanya untuk pengguna berusia 21 tahun ke atas.'
  });
}
