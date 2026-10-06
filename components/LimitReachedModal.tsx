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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border-2 border-ink rounded-none p-6 sm:p-7 shadow-2xl space-y-6 relative overflow-hidden isolate">
        {/* Glow backdrop */}
        <div className="border-2 border-ink absolute -top-24 -right-24 w-48 h-48 bg-alert rounded-full pointer-events-none -z-10"></div>
        <div className="border-2 border-ink absolute -bottom-24 -left-24 w-48 h-48 bg-iris rounded-full pointer-events-none -z-10"></div>

        {/* Close Button */}
        <button
          onClick={() => setShowLimitModal(false)}
          className="absolute top-5 right-5 p-2 rounded-none bg-paper hover:bg-sun text-ink/65 hover:text-ink transition-colors border-2 border-ink cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-none bg-alert/50 border-2 border-ink flex items-center justify-center text-ink shrink-0 shadow-lg">
            <AlertCircle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-none text-[11px] font-mono font-bold uppercase tracking-wider bg-paper text-danger border-2 border-ink inline-block mb-1">
              Kuota Harian Tercapai
            </span>
            <h3 className="text-lg font-serif text-ink font-extrabold">
              Batas Penggunaan Harian
            </h3>
          </div>
        </div>

        {/* Main Alert Message */}
        <div className="shadow-lg p-4 rounded-none bg-blush border-2 border-ink space-y-2">
          <p className="text-sm font-medium text-ink leading-relaxed">
            Limit harian Anda telah habis. Beli VIP sekarang untuk menaikkan plan dan melanjutkan penggunaan.
          </p>
          <p className="text-xs text-ink/80 font-medium">
            Plan saat ini: <strong className="text-forest uppercase">{tier}</strong> ({quotaLimit} request/hari). Kuota akan otomatis di-reset besok pukul 00:00 WIB, atau Anda bisa upgrade ke VIP tanpa perlu menunggu.
          </p>
        </div>

        {/* VIP Benefits Mini List */}
        <div className="space-y-2 text-xs text-ink/80">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
            <span>VIP: <strong>500 Request / Hari</strong> (Hanya Rp 5.000 / bln)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
            <span>VIP+: <strong>1.000 Request / Hari</strong> (Hanya Rp 10.000 / bln)</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber shrink-0" />
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
            className="bg-iris hover:bg-sun border-2 border-ink w-full py-3.5 px-6 rounded-none text-ink font-bold text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Sparkles className="w-4 h-4" />
            <span>Lihat Paket VIP Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowLimitModal(false)}
            className="w-full py-2.5 text-center text-xs text-ink/65 hover:text-ink transition-colors cursor-pointer"
          >
            Tutup dan Tunggu Reset Besok
          </button>
        </div>
      </div>
    </div>
  );
};