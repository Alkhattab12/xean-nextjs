// Replaces the in-memory userStore/transactionStore from lib/store.ts with
// real Postgres persistence via Supabase. This is what actually fixes the
// "quota resets to 0 on logout/login" bug: previously quota_used lived in a
// process-memory Map keyed by a randomly generated ID that Vercel's
// serverless instances don't reliably share (see the note that used to be
// in lib/store.ts). Now it's one row per real Supabase Auth user id (stable
// across every login, including Google OAuth), so it survives cold starts,
// redeploys, and logging out and back in — because it was never tied to the
// server process's memory in the first place.
import { createSupabaseAdminClient } from './server';

// Wraps createSupabaseAdminClient() so a missing SUPABASE_SERVICE_ROLE_KEY
// (e.g. mid-setup, before you've added it to Vercel env vars) degrades to
// "treat as unresolvable" everywhere below instead of an unhandled throw
// that would surface as a raw 500 to the user. Logged once per call site,
// not silently swallowed.
function getAdminOrNull() {
  try {
    return createSupabaseAdminClient();
  } catch (e: any) {
    console.error('[profile-store] Supabase admin client unavailable:', e.message);
    return null;
  }
}

export const TIER_LIMITS = {
  free: 50,
  vip: 500,
  vip_plus: 1000
} as const;

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  tier: 'free' | 'vip' | 'vip_plus';
  quota_used: number;
  quota_limit: number;
  last_reset_date: string;
  tier_expires_at: string | null;
  age_verified_21plus: boolean;
  birth_year: number | null;
  created_at: string;
  updated_at: string;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

// Fetches a profile and applies the same lazy reset rules the original
// in-memory resolveUser() had (daily quota reset, VIP expiry check) — except
// now the reset is actually written back to Postgres, so it sticks.
export async function getProfile(userId: string): Promise<Profile | null> {
  const admin = getAdminOrNull();
  if (!admin) return null;
  const { data: profile, error } = await admin.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (error || !profile) return null;


  const patch: Record<string, any> = {};
  const today = todayStr();

  if (profile.last_reset_date !== today) {
    patch.quota_used = 0;
    patch.last_reset_date = today;
  }

  if (profile.tier !== 'free' && profile.tier_expires_at && new Date(profile.tier_expires_at).getTime() < Date.now()) {
    patch.tier = 'free';
    patch.quota_limit = TIER_LIMITS.free;
    patch.tier_expires_at = null;
  }

  if (Object.keys(patch).length > 0) {
    const { data: updated } = await admin.from('profiles').update(patch).eq('id', userId).select('*').single();
    return (updated as Profile) ?? { ...profile, ...patch };
  }

  return profile as Profile;
}

export async function incrementQuota(userId: string): Promise<{ quota_used: number; quota_limit: number } | null> {
  const profile = await getProfile(userId);
  if (!profile) return null;

  const admin = getAdminOrNull();
  if (!admin) return null;
  const nextUsed = (profile.quota_used || 0) + 1;
  const { data, error } = await admin
    .from('profiles')
    .update({ quota_used: nextUsed, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('quota_used, quota_limit')
    .single();

  if (error) return null;
  return data;
}

export async function upgradeTier(
  userId: string,
  tier: 'free' | 'vip' | 'vip_plus',
  durationDays = 30
): Promise<Profile | null> {
  const admin = getAdminOrNull();
  if (!admin) return null;
  const { data, error } = await admin
    .from('profiles')
    .update({
      tier,
      quota_limit: TIER_LIMITS[tier],
      tier_expires_at: tier === 'free' ? null : new Date(Date.now() + durationDays * 86400000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) return null;
  return data as Profile;
}

// Age verification is ALWAYS computed server-side from a birth year, never
// accepted as a raw true/false from the client — otherwise anyone could just
// POST {age_verified_21plus: true} and unlock adult(18+) tools regardless of
// real age.
export async function submitAgeVerification(
  userId: string,
  birthYear: number
): Promise<{ profile: Profile | null; isOver21: boolean; error?: string }> {
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(birthYear) || birthYear < currentYear - 120 || birthYear > currentYear - 13) {
    return { profile: null, isOver21: false, error: 'Tahun lahir tidak valid.' };
  }

  const age = currentYear - birthYear;
  const isOver21 = age >= 21;

  const admin = getAdminOrNull();
  if (!admin) return { profile: null, isOver21: false, error: 'Layanan verifikasi sedang tidak tersedia (konfigurasi server belum lengkap).' };
  const { data, error } = await admin
    .from('profiles')
    .update({ birth_year: birthYear, age_verified_21plus: isOver21, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) return { profile: null, isOver21: false, error: error.message };
  return { profile: data as Profile, isOver21 };
}

export interface TransactionRecord {
  deposit_id: string;
  user_id: string;
  user_email: string;
  tier: 'vip' | 'vip_plus';
  plan_name: string;
  amount: number;
  total_amount: number;
  unique_code: number;
  fee: number;
  qr_image: string | null;
  qr_string: string | null;
  status: 'pending' | 'success' | 'already' | 'expired' | 'failed';
  created_at: string;
  expired_at: string | null;
  completed_at: string | null;
}

export async function createTransaction(tx: Omit<TransactionRecord, 'created_at' | 'completed_at'>) {
  const admin = getAdminOrNull();
  if (!admin) throw new Error('Supabase admin client unavailable (missing SUPABASE_SERVICE_ROLE_KEY).');
  await admin.from('transactions').insert({ ...tx, created_at: new Date().toISOString() });
}

export async function getTransaction(depositId: string): Promise<TransactionRecord | null> {
  const admin = getAdminOrNull();
  if (!admin) return null;
  const { data } = await admin.from('transactions').select('*').eq('deposit_id', depositId).maybeSingle();
  return data as TransactionRecord | null;
}

export async function markTransactionStatus(depositId: string, status: TransactionRecord['status']) {
  const admin = getAdminOrNull();
  if (!admin) return;
  await admin
    .from('transactions')
    .update({ status, completed_at: status === 'success' ? new Date().toISOString() : null })
    .eq('deposit_id', depositId);
}
