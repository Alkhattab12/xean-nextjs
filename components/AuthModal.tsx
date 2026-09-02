'use client';

import React, { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../utils/userContext';
import { toast } from 'sonner';

// Rewritten: the original collected email + a password field that was never
// actually checked (login() only ever used the email), plus a "1-click
// demo" button that fabricated a random throwaway account — neither
// survives the move to real accounts. Sign-in is now exclusively Google
// OAuth via Supabase, which is also what makes per-account quota persist
// correctly across logout/login (see README).
export const AuthModal: React.FC = () => {
  const { showAuthModal, setShowAuthModal, signInWithGoogle, selectedPlanForCheckout } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!showAuthModal) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      // Supabase redirects the whole page to Google, then back to
      // /auth/callback — execution here effectively ends at await above.
    } catch (err: any) {
      toast.error(err.message || 'Gagal memulai login Google');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0D0D0D] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#4F46E5]/25 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#00FF88]/15 rounded-full blur-3xl pointer-events-none"></div>

        <button
          onClick={() => setShowAuthModal(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#161616] hover:bg-[#222] text-[#888] hover:text-white transition-colors border border-white/5 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1A1A] border border-white/10 text-[10px] font-mono uppercase tracking-widest text-[#00FF88]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Xean Secure Access</span>
          </div>
          <h3 className="text-2xl font-serif italic text-white font-normal">Masuk ke Xean Digital</h3>
          <p className="text-xs text-[#888] font-light">
            {selectedPlanForCheckout && selectedPlanForCheckout !== 'free'
              ? `Login dengan Google untuk melanjutkan pembelian paket ${selectedPlanForCheckout.toUpperCase()}.`
              : 'Login dengan akun Google untuk kuota harian yang tersimpan permanen, riwayat, dan akses fitur VIP.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-full bg-white hover:bg-[#F5F5F5] text-black font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-3 cursor-pointer active:scale-98 disabled:opacity-50"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Lanjutkan dengan Google</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-[#666] text-center leading-relaxed">
          Dengan masuk, Anda menyetujui bahwa fitur konten 18+ mensyaratkan verifikasi usia terpisah
          (minimal 21 tahun) setelah login.
        </p>
      </div>
    </div>
  );
};
