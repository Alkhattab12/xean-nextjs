'use client';

import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { useAuth } from '../utils/userContext';
import { toast } from 'sonner';

// New component: shown when a logged-in user taps an adult(18+)-tagged tool
// and hasn't verified their age yet (see requestAdultAccess() in
// userContext.tsx). Age is self-declared (birth year) — same trade-off every
// mainstream site without paid ID-verification makes — but the resulting
// 21+ decision is computed and stored server-side (app/api/user/verify-age),
// never accepted as a raw true/false from this form, and re-checked again on
// every server-side adult-tool request regardless of what the client shows.
export const AgeVerificationModal: React.FC = () => {
  const { showAgeVerifyModal, setShowAgeVerifyModal, submitAgeVerification } = useAuth();
  const [birthYear, setBirthYear] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showAgeVerifyModal) return null;

  const currentYear = new Date().getFullYear();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const year = parseInt(birthYear, 10);
    if (!year || year < currentYear - 120 || year > currentYear - 13) {
      toast.error('Masukkan tahun lahir yang valid');
      return;
    }

    setLoading(true);
    const result = await submitAgeVerification(year);
    setLoading(false);

    if (result.success) {
      if (result.isOver21) {
        toast.success('Verifikasi berhasil — konten 18+ kini dapat diakses.');
        setShowAgeVerifyModal(false);
      } else {
        toast.error('Konten 18+ hanya untuk pengguna berusia 21 tahun ke atas.');
        setShowAgeVerifyModal(false);
      }
    } else {
      toast.error(result.error || 'Gagal menyimpan verifikasi usia');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0D0D0D] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative">
        <button
          onClick={() => setShowAgeVerifyModal(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#161616] hover:bg-[#222] text-[#888] hover:text-white transition-colors border border-white/5 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-mono uppercase tracking-widest text-red-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Verifikasi Usia Diperlukan</span>
          </div>
          <h3 className="text-xl font-serif italic text-white font-normal">Konten Khusus Dewasa</h3>
          <p className="text-xs text-[#888] font-light leading-relaxed">
            Kategori tool ini hanya tersedia untuk pengguna berusia 21 tahun ke atas. Masukkan tahun
            lahir Anda untuk melanjutkan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono uppercase text-[#AAA] tracking-wider block">Tahun Lahir</label>
            <input
              type="number"
              inputMode="numeric"
              required
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              placeholder={`Contoh: ${currentYear - 25}`}
              className="w-full px-4 py-2.5 rounded-xl bg-[#141414] border border-white/10 text-white text-sm placeholder-[#555] focus:outline-none focus:border-red-500/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-6 rounded-full bg-white hover:bg-red-400 text-black font-bold text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span>Verifikasi & Lanjutkan</span>
            )}
          </button>
        </form>

        <p className="text-[10px] text-[#555] text-center leading-relaxed">
          Data ini hanya digunakan untuk verifikasi usia dan disimpan sesuai kebijakan privasi kami.
        </p>
      </div>
    </div>
  );
};
