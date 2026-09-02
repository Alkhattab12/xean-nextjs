import { NextRequest, NextResponse } from 'next/server';
import { userStore, findUserByEmail, getTodayString, TIER_LIMITS, type ServerUser } from '@/lib/store';

// Ported verbatim from server.ts's `app.post('/api/auth/login', ...)`.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { email, name } = body;

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ success: false, error: 'Email wajib diisi' }, { status: 400 });
  }

  const cleanEmail = email.trim().toLowerCase();
  let existingUser: ServerUser | undefined = findUserByEmail(cleanEmail);

  if (!existingUser) {
    const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    existingUser = {
      id: newId,
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      tier: 'free',
      quotaUsed: 0,
      quotaLimit: TIER_LIMITS.free,
      createdAt: Date.now(),
      lastResetDate: getTodayString()
    };
    userStore.set(newId, existingUser);
  } else {
    const today = getTodayString();
    if (existingUser.lastResetDate !== today) {
      existingUser.quotaUsed = 0;
      existingUser.lastResetDate = today;
    }
  }

  return NextResponse.json({ success: true, user: existingUser });
}
