'use client';

import React from 'react';
import { AlertCircle, Zap, Sparkles, X, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../utils/userContext';
import { ActiveTab } from '../types';

interface LimitReachedModalProps {
  onNavigateToPricing: () => void;
}

export const LimitReachedModal: React.FC<LimitReachedModalProps> = ({ onNavigateToPricing }) => {
  const { showLimitModal, setShowLimitModal, tier, quotaLimit } = useAuth();

  if (!showLimitModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#0D0D0D] border border-[#FF3344]/30 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF3344]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#4F46E5]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={() => setShowLimitModal(false)}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#161616] hover:bg-[#222] text-[#888] hover:text-white transition-colors border border-white/5 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FF3344]/15 border border-[#FF3344]/30 flex items-center justify-center text-[#FF5555] shrink-0 shadow-lg">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-[#1A1A1A] text-[#FF5555] border border-[#FF3344]/30 inline-block mb-1">
              Kuota Harian Tercapai
            </span>
            <h3 className="text-lg font-serif italic text-white font-normal">
              Batas Penggunaan Harian
            </h3>
          </div>
        </div>

        {/* Main Alert Message */}
        <div className="p-4 rounded-2xl bg-[#140808] border border-[#FF3344]/20 space-y-2">
          <p className="text-sm font-medium text-white leading-relaxed">
            Limit harian Anda telah habis. Beli VIP sekarang untuk menaikkan plan dan melanjutkan penggunaan.
          </p>
          <p className="text-xs text-[#AAA] font-light">
            Plan saat ini: <strong className="text-[#00FF88] uppercase">{tier}</strong> ({quotaLimit} request/hari). Kuota akan otomatis di-reset besok pukul 00:00 WIB, atau Anda bisa upgrade ke VIP tanpa perlu menunggu.
          </p>
        </div>

        {/* VIP Benefits Mini List */}
        <div className="space-y-2 text-xs text-[#CCC]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00FF88] shrink-0" />
            <span>VIP: <strong>500 Request / Hari</strong> (Hanya Rp 5.000 / bln)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#00FF88] shrink-0" />
            <span>VIP+: <strong>1.000 Request / Hari</strong> (Hanya Rp 10.000 / bln)</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#FFCC00] shrink-0" />
            <span>Koneksi Server Prioritas Cepat & Stabil</span>
          </div>
        </div>

        {/* Direct Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={() => {
              setShowLimitModal(false);
              onNavigateToPricing();
            }}
            className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#00FF88] hover:opacity-90 text-white font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Lihat Paket VIP Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowLimitModal(false)}
            className="w-full py-2.5 text-center text-xs text-[#888] hover:text-white transition-colors cursor-pointer"
          >
            Tutup dan Tunggu Reset Besok
          </button>
        </div>
      </div>
    </div>
  );
};