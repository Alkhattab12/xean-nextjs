'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { UserProfile, SubscriptionTier } from '../types';
import { createSupabaseBrowserClient } from '../lib/supabase/client';

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  tier: SubscriptionTier;
  quotaUsed: number;
  quotaLimit: number;
  quotaRemaining: number;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  upgradeTier: (newTier: SubscriptionTier, durationDays?: number) => Promise<boolean>;
  applyActivatedUser: (updatedUser: UserProfile) => void;
  recordRequestUsage: () => boolean;
  isLimitReached: boolean;
  showLimitModal: boolean;
  setShowLimitModal: (show: boolean) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  showCheckoutModal: boolean;
  setShowCheckoutModal: (show: boolean) => void;
  selectedPlanForCheckout: SubscriptionTier | null;
  setSelectedPlanForCheckout: (plan: SubscriptionTier | null) => void;
  openCheckout: (plan: SubscriptionTier) => void;
  refreshUserStats: () => void;
  // Age-gate for adult(18+) tools
  isAgeVerified: boolean;
  showAgeVerifyModal: boolean;
  setShowAgeVerifyModal: (show: boolean) => void;
  submitAgeVerification: (birthYear: number) => Promise<{ success: boolean; isOver21: boolean; error?: string }>;
  requestAdultAccess: () => boolean; // returns true if already allowed, else opens the right modal
}

const TIER_LIMITS: Record<SubscriptionTier, number> = {
  free: 50,
  vip: 500,
  vip_plus: 1000
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [guestUsage, setGuestUsage] = useState<number>(0);
  const [hydrated, setHydrated] = useState(false);

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showAgeVerifyModal, setShowAgeVerifyModal] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionTier | null>(null);

  const tier: SubscriptionTier = user?.tier || 'free';
  const quotaLimit = user ? (TIER_LIMITS[user.tier] || TIER_LIMITS.free) : TIER_LIMITS.free;
  const quotaUsed = user ? (user.quotaUsed || 0) : guestUsage;
  const quotaRemaining = Math.max(0, quotaLimit - quotaUsed);
  const isLimitReached = quotaUsed >= quotaLimit;
  const isAgeVerified = !!user?.ageVerified21Plus;

  // Hydrate guest usage from localStorage after mount (client-only — see
  // README for why this can't happen synchronously in useState here)
  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const savedDate = localStorage.getItem('xean_guest_usage_date');
      if (savedDate === today) {
        const count = localStorage.getItem('xean_guest_usage_count');
        setGuestUsage(count ? parseInt(count, 10) : 0);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('xean_guest_usage_date', today);
      localStorage.setItem('xean_guest_usage_count', String(guestUsage));
    } catch {}
  }, [guestUsage, hydrated]);

  const refreshUserStats = useCallback(async () => {
    try {
      const res = await fetch('/api/user/status');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else if (data.success && !data.user) {
          setUser(null);
          setGuestUsage(data.guestQuotaUsed || 0);
        }
      }
    } catch (e) {
      console.warn('Server status fetch failed:', e);
    }
  }, []);

  // Real auth: a Supabase session (set via Google OAuth redirect through
  // /auth/callback) is the single source of truth for who's logged in. This
  // replaces the old email-only "login" — no more locally-fabricated user
  // objects, so there's nothing left that can drift from what the server
  // (and therefore the persisted Postgres quota) actually has.
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    refreshUserStats();

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        refreshUserStats();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInWithGoogle = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  };

  const logout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  const applyActivatedUser = (updatedUser: UserProfile) => {
    setUser(updatedUser);
  };

  const upgradeTier = async (newTier: SubscriptionTier, durationDays: number = 30): Promise<boolean> => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }

    if (newTier === 'free') {
      try {
        const res = await fetch('/api/user/upgrade-tier', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tier: 'free', durationDays, bypassSecret: 'xean_internal_verified_paid' })
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          return true;
        }
      } catch (e) {
        console.warn('Downgrade to free error:', e);
      }
      return true;
    }

    // For VIP / VIP+, require QRIS checkout flow
    openCheckout(newTier);
    return false;
  };

  const recordRequestUsage = (): boolean => {
    if (isLimitReached) {
      setShowLimitModal(true);
      return false;
    }

    if (user) {
      const nextUsed = (user.quotaUsed || 0) + 1;
      setUser((prev) => (prev ? { ...prev, quotaUsed: nextUsed } : null));
      if (nextUsed >= quotaLimit) setShowLimitModal(true);
    } else {
      const nextGuest = guestUsage + 1;
      setGuestUsage(nextGuest);
      if (nextGuest >= TIER_LIMITS.free) setShowLimitModal(true);
    }

    try {
      fetch('/api/user/record-usage', { method: 'POST' }).catch(() => {});
    } catch {}

    return true;
  };

  const openCheckout = (plan: SubscriptionTier) => {
    if (plan === 'free') return;
    if (!user) {
      setSelectedPlanForCheckout(plan);
      setShowAuthModal(true);
      return;
    }
    setSelectedPlanForCheckout(plan);
    setShowCheckoutModal(true);
  };

  const submitAgeVerification = async (birthYear: number) => {
    try {
      const res = await fetch('/api/user/verify-age', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthYear })
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => (prev ? { ...prev, ageVerified21Plus: data.isOver21 } : prev));
        return { success: true, isOver21: data.isOver21 };
      }
      return { success: false, isOver21: false, error: data.error };
    } catch (e: any) {
      return { success: false, isOver21: false, error: e.message };
    }
  };

  // Call this wherever the user taps something adult(18+)-tagged. Returns
  // true if they're already cleared to proceed; otherwise it opens the
  // right modal (sign in first, or verify age) and returns false.
  const requestAdultAccess = (): boolean => {
    if (!user) {
      setShowAuthModal(true);
      return false;
    }
    if (!user.ageVerified21Plus) {
      setShowAgeVerifyModal(true);
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        tier,
        quotaUsed,
        quotaLimit,
        quotaRemaining,
        signInWithGoogle,
        logout,
        upgradeTier,
        applyActivatedUser,
        recordRequestUsage,
        isLimitReached,
        showLimitModal,
        setShowLimitModal,
        showAuthModal,
        setShowAuthModal,
        showCheckoutModal,
        setShowCheckoutModal,
        selectedPlanForCheckout,
        setSelectedPlanForCheckout,
        openCheckout,
        refreshUserStats,
        isAgeVerified,
        showAgeVerifyModal,
        setShowAgeVerifyModal,
        submitAgeVerification,
        requestAdultAccess
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
