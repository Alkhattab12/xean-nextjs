// Ported from the original Express server.ts's in-memory user/quota store
// (lines ~58-134). The data model and reset/expiry logic are unchanged.
//
// ============================================================================
// READ THIS BEFORE RELYING ON THIS IN PRODUCTION
// ============================================================================
// The original app kept `userStore`/`transactionStore` as plain in-memory
// Maps because it ran as one long-lived Express process (e.g. on a
// persistent container). On Vercel, this file's module state only survives
// for as long as ONE serverless function instance stays warm:
//
//   - Vercel's Fluid Compute (on by default for new projects as of 2025)
//     does reuse warm instances across requests more aggressively than
//     classic Lambda-style serverless, so in low/moderate steady traffic
//     from one region this store will often "just work" for a while.
//   - But it is NOT a database. Under concurrent scaling, multi-region
//     traffic, an idle timeout, or a new deployment, a request can land on
//     a fresh instance with an EMPTY store — so a user who just paid for
//     VIP could intermittently look like a free-tier guest again until a
//     request happens to hit an instance that still remembers them.
//
// This is a correctness risk specifically for tier/quota state (which is
// billing-adjacent), not a crash risk — the app still runs and deploys
// fine. It's called out explicitly rather than silently shipped, per the
// conversion analysis. If/when you want this fully consistent in
// production, the straightforward fix is swapping these two Maps for a
// real persistence layer (e.g. Supabase Postgres, which you're already
// using for Veltapedia — two small tables, `users` and `transactions`,
// mirroring the shapes below — or Vercel KV/Upstash Redis for a lighter
// key-value swap). Ask and this can be wired up as a follow-up.
// ============================================================================

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'vip' | 'vip_plus';
  quotaUsed: number;
  quotaLimit: number;
  tierExpiresAt?: number;
  createdAt: number;
  lastResetDate: string;
}

export interface PaymentTransaction {
  depositId: string;
  userId: string;
  userEmail: string;
  tier: 'vip' | 'vip_plus';
  planName: string;
  amount: number;
  totalAmount: number;
  uniqueCode: number;
  fee: number;
  qrImage: string;
  qrString: string;
  status: 'pending' | 'success' | 'already' | 'expired' | 'failed';
  createdAt: number;
  expiredAt: string;
  completedAt?: number;
}

const globalForStore = globalThis as unknown as {
  __xeanUserStore?: Map<string, ServerUser>;
  __xeanTransactionStore?: Map<string, PaymentTransaction>;
};

export const userStore: Map<string, ServerUser> =
  globalForStore.__xeanUserStore ?? new Map();
globalForStore.__xeanUserStore = userStore;

export const transactionStore: Map<string, PaymentTransaction> =
  globalForStore.__xeanTransactionStore ?? new Map();
globalForStore.__xeanTransactionStore = transactionStore;

export const TIER_LIMITS = {
  free: 100,
  vip: 500,
  vip_plus: 1000
} as const;

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Adapted from the original `resolveUser(req: Request)`. Express let you
// read `req.headers`, `req.body`, and `req.query` all off one synchronous
// object; a Next.js Route Handler's NextRequest doesn't (body is an async
// stream read once), so each call site extracts userId/userEmail from
// whichever of headers/body/query apply to that specific route — in the
// same precedence order as the original (header, then body, then query) —
// and passes them in here directly.
export function resolveUser(userId?: string | null, userEmail?: string | null): ServerUser | null {
  let user: ServerUser | undefined;
  if (userId && userStore.has(userId)) {
    user = userStore.get(userId);
  } else if (userEmail) {
    for (const u of userStore.values()) {
      if (u.email.toLowerCase() === userEmail.toLowerCase()) {
        user = u;
        break;
      }
    }
  }

  if (user) {
    const today = getTodayString();
    if (user.lastResetDate !== today) {
      user.quotaUsed = 0;
      user.lastResetDate = today;
    }
    // Check VIP expiration
    if (user.tier !== 'free' && user.tierExpiresAt && user.tierExpiresAt < Date.now()) {
      user.tier = 'free';
      user.quotaLimit = TIER_LIMITS.free;
    }
    return user;
  }

  return null;
}

export function findUserByEmail(email: string): ServerUser | undefined {
  const lower = email.toLowerCase();
  for (const u of userStore.values()) {
    if (u.email.toLowerCase() === lower) return u;
  }
  return undefined;
}
