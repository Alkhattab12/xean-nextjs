'use client';

import React from 'react';
import { 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Crown, 
  Star, 
  ArrowRight, 
  Layers, 
  Flame,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../utils/userContext';
import { SubscriptionTier } from '../types';

export const PricingView: React.FC = () => {
  const { user, tier, openCheckout, quotaUsed, quotaLimit } = useAuth();

  const plans = [
    {
      id: 'free' as SubscriptionTier,
      name: 'Free Plan',
      tierLabel: 'STARTER',
      tagline: 'Solusi dasar harian untuk eksplorasi dan unduhan media reguler.',
      price: 'Rp 0',
      period: 'Gratis Selamanya',
      quota: '100 Request / Hari',
      quotaNum: 100,
      popular: false,
      isUltra: false,
      style: {
        container: 'bg-white border-2 border-ink shadow-xl hover:-translate-y-1 hover:shadow-2xl',
        badge: 'bg-paper text-ink border-2 border-ink',
        button: 'bg-white text-ink hover:bg-sun border-2 border-ink font-bold',
        glow: 'bg-paper',
        accent: 'text-ink'
      },
      features: [
        { text: 'Kuota 100 request / hari', included: true, bold: true },
        { text: 'Akses ke semua fitur dasar', included: true },
        { text: 'Universal Media Downloader (HD)', included: true },
        { text: 'Unduhan Massal Multi-Tautan', included: true },
        { text: 'Akses 334+ Katalog API & Tools', included: true },
        { text: 'Kecepatan Standar', included: true },
        { text: 'Jalur Eksekusi Dedicated VIP', included: false },
        { text: 'Akses Jalur Server Prioritas Tinggi', included: false }
      ]
    },
    {
      id: 'vip' as SubscriptionTier,
      name: 'VIP Plan',
      tierLabel: 'POPULER • SEMI-PREMIUM',
      tagline: 'Pilihan paling populer untuk kreator konten dan power user aktif.',
      price: 'Rp 5.000',
      period: '/ bulan',
      quota: '500 Request / Hari',
      quotaNum: 500,
      popular: true,
      isUltra: false,
      style: {
        container: 'bg-iris border-2 border-ink shadow-2xl hover:-translate-y-1',
        badge: 'bg-sun text-ink font-bold border-2 border-ink shadow-sm',
        button: 'bg-white text-ink hover:bg-sun border-2 border-ink font-bold',
        glow: 'bg-iris',
        accent: 'text-ink'
      },
      features: [
        { text: 'Kuota 500 request / hari', included: true, bold: true },
        { text: 'Akses semua fitur tanpa batasan', included: true, bold: true },
        { text: 'Jalur Eksekusi Cepat & Prioritas Tinggi', included: true, bold: true },
        { text: 'Unduhan Video Kualitas Maksimal 4K & MP3 320kbps', included: true },
        { text: 'AI Studio Multi-Model Cepat', included: true },
        { text: 'Akses Semua 334+ Tool Premium', included: true },
        { text: 'Bebas Antrean Trafik Padat', included: true },
        { text: 'Dukungan Prioritas Komunitas', included: true }
      ]
    },
    {
      id: 'vip_plus' as SubscriptionTier,
      name: 'VIP+ Plan',
      tierLabel: 'ULTRA-PREMIUM • BEST VALUE',
      tagline: 'Tingkat tertinggi paling mewah & eksklusif dengan kuota raksasa.',
      price: 'Rp 10.000',
      period: '/ bulan',
      quota: '1.000 Request / Hari',
      quotaNum: 1000,
      popular: false,
      isUltra: true,
      style: {
        container: 'bg-volt border-2 border-ink shadow-2xl hover:-translate-y-1 relative overflow-hidden',
        badge: 'bg-ink text-volt font-black uppercase tracking-wider border-2 border-ink',
        button: 'bg-ink text-white hover:bg-pink hover:text-ink border-2 border-ink font-black',
        glow: 'bg-volt',
        accent: 'text-ink'
      },
      features: [
        { text: 'Kuota 1.000 request / hari (Kuota Jumbo)', included: true, bold: true },
        { text: 'Akses semua fitur VIP + kuota lebih besar', included: true, bold: true },
        { text: 'Akses Jalur Server Prioritas Tertinggi (Level 0)', included: true, bold: true },
        { text: 'Ultra-Fast Response Time & Zero Queue', included: true },
        { text: 'Unlimited Batch Download Multi-Thread', included: true },
        { text: 'Akses Eksklusif Semua Fitur Baru Pertama Kali', included: true },
        { text: 'Full 24/7 Priority Support WhatsApp', included: true },
        { text: 'Badge Spesial VIP+ di Akun Anda', included: true }
      ]
    }
  ];

  return (
    <div className="space-y-16 py-4 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none bg-white border-2 border-ink text-[11px] font-mono text-ink/80 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-forest" />
          <span>Paket Langganan & Kuota Fleksibel</span>
        </div>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-ink font-extrabold tracking-tight">
          Pilihan Paket <span className="bg-volt text-ink px-2 box-decoration-clone font-sans not-italic font-medium      ">Xean Subscription</span>
        </h2>
        <p className="text-xs sm:text-sm text-ink/65 font-medium leading-relaxed max-w-2xl mx-auto">
          Tingkatkan kuota harian dan nikmati akses penuh tanpa hambatan dengan performa respon super cepat dan tanpa antrean.
        </p>

        {/* Current Active Plan Status Banner */}
        <div className="pt-2">
          <div className="inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2.5 rounded-none bg-white border-2 border-ink shadow-lg text-xs">
            <span className="text-ink/65">Status Akun Anda:</span>
            <span className={`px-2.5 py-0.5 rounded-none font-mono font-bold uppercase tracking-wider text-[11px] ${
              tier === 'vip_plus'
                ? 'bg-volt/50 text-ink border-2 border-ink'
                : tier === 'vip'
                ? 'bg-iris/50 text-ink border-2 border-ink'
                : 'bg-ink/10 text-ink'
            }`}>
              {tier === 'vip_plus' ? 'VIP+ Plan' : tier === 'vip' ? 'VIP Plan' : 'Free Plan'}
            </span>
            <span className="text-ink/55">•</span>
            <span className="text-ink/80 font-mono">
              Penggunaan: <strong className="text-ink">{quotaUsed}</strong> / {quotaLimit} Request
            </span>
          </div>
        </div>
      </div>

      {/* 3 Pricing Cards Grid with Tier Differentiation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto items-stretch">
        {plans.map((plan) => {
          const isCurrentTier = tier === plan.id;

          return (
            <div
              key={plan.id}
              className={`rounded-none p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 relative ${plan.style.container}`}
            >

              <div className="space-y-6">
                {/* Top Badge & Tier Label */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-3 py-1 rounded-none text-[11px] font-mono tracking-wider ${plan.style.badge}`}>
                    {plan.tierLabel}
                  </span>
                  {plan.id === 'free' && (
                    <span className="text-[11px] font-mono text-ink/65">Standard</span>
                  )}
                  {plan.id === 'vip' && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-irisdeep">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Recommended</span>
                    </span>
                  )}
                  {plan.id === 'vip_plus' && (
                    <span className="flex items-center gap-1 text-[11px] font-mono text-forest font-bold">
                      <Crown className="w-3.5 h-3.5 fill-current" />
                      <span>Best Choice</span>
                    </span>
                  )}
                </div>

                {/* Title & Tagline */}
                <div className="space-y-1.5">
                  <h3 className="text-2xl sm:text-3xl font-serif text-ink font-extrabold">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-ink/65 font-medium leading-relaxed min-h-[36px]">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price Display */}
                <div className="p-4 rounded-none bg-black/40 border-2 border-ink space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-mono font-bold text-ink tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs font-mono text-ink/65">{plan.period}</span>
                  </div>
                  <div className="border-dashed pt-2 border-t border-ink flex items-center justify-between text-xs font-mono">
                    <span className="text-ink/65">Kuota Harian:</span>
                    <span className={`font-bold ${plan.style.accent}`}>{plan.quota}</span>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-mono text-ink/65 block">
                    Fitur & Keuntungan
                  </span>
                  <ul className="space-y-2.5 text-xs">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        {feat.included ? (
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
                            plan.isUltra ? 'text-forest' : plan.popular ? 'text-irisdeep' : 'text-ink/65'
                          }`} />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-ink flex items-center justify-center shrink-0 mt-0.5 opacity-40">
                            <span className="text-[11px] text-ink/65 leading-none">✕</span>
                          </div>
                        )}
                        <span className={`${
                          feat.included 
                            ? (feat.bold ? 'text-ink font-medium' : 'text-ink/80') 
                            : 'text-ink/55 line-through'
                        }`}>
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action / Upgrade Button */}
              <div className="pt-8 mt-auto">
                {isCurrentTier ? (
                  <div className="w-full py-3.5 px-4 rounded-none bg-ink/10 text-ink font-mono text-xs text-center border-2 border-ink">
                    ✓ Paket Aktif Anda
                  </div>
                ) : plan.id === 'free' ? (
                  <button
                    disabled
                    className="w-full py-3.5 px-4 rounded-none bg-paper text-ink/65 font-mono text-xs text-center border-2 border-ink cursor-not-allowed"
                  >
                    Paket Bawaan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openCheckout(plan.id)}
                    className={`w-full py-4 px-6 rounded-none text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-lg ${plan.style.button}`}
                  >
                    <span>Pilih {plan.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Detail Matrix */}
      <div className="shadow-lg max-w-4xl mx-auto rounded-none bg-paper border-2 border-ink p-6 sm:p-8 space-y-6">
        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-serif text-ink font-extrabold">
            Tabel Komparasi Fitur & Kuota
          </h3>
          <p className="text-xs text-ink/65 font-medium">
            Detail perbandingan kuota dan infrastruktur API antar paket langganan Xean Digital.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-dashed border-b border-ink text-ink/65">
                <th className="py-3 px-3">Fitur & Parameter</th>
                <th className="py-3 px-3 text-center">Free</th>
                <th className="py-3 px-3 text-center text-irisdeep">VIP</th>
                <th className="py-3 px-3 text-center text-forest">VIP+</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/30 text-ink/80">
              <tr>
                <td className="py-3 px-3 font-sans text-ink">Batas Kuota Harian</td>
                <td className="py-3 px-3 text-center">100 Req</td>
                <td className="py-3 px-3 text-center font-bold text-ink">500 Req</td>
                <td className="py-3 px-3 text-center font-bold text-forest">1.000 Req</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans text-ink">Harga Langganan</td>
                <td className="py-3 px-3 text-center">Rp 0</td>
                <td className="py-3 px-3 text-center font-bold text-ink">Rp 5.000 / bln</td>
                <td className="py-3 px-3 text-center font-bold text-forest">Rp 10.000 / bln</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans text-ink">Prioritas Antrean Server</td>
                <td className="py-3 px-3 text-center">Standard</td>
                <td className="py-3 px-3 text-center">Tinggi</td>
                <td className="py-3 px-3 text-center font-bold text-forest">Prioritas Utama (0)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-sans text-ink">Akses 334+ Fitur & Tools</td>
                <td className="py-3 px-3 text-center text-forest">✓</td>
                <td className="py-3 px-3 text-center text-forest">✓</td>
                <td className="py-3 px-3 text-center text-forest">✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <h3 className="text-xl sm:text-2xl font-serif text-ink font-extrabold">
            Pertanyaan Umum (FAQ)
          </h3>
          <p className="text-xs text-ink/65">Hal yang sering ditanyakan seputar paket VIP Xean Digital.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Kapan kuota harian di-reset?',
              a: 'Kuota harian Anda otomatis di-reset setiap hari pukul 00:00 WIB. Anda akan mendapatkan kuota penuh kembali setiap harinya sesuai paket aktif Anda.'
            },
            {
              q: 'Apakah saya wajib login sebelum membeli paket VIP?',
              a: 'Ya, Anda wajib login atau mendaftarkan akun agar paket VIP yang Anda beli dapat langsung dikaitkan dan aktif secara otomatis pada akun Anda setelah pembayaran terverifikasi.'
            },
            {
              q: 'Apa keunggulan paket VIP dan VIP+?',
              a: 'Paket VIP (500 req/hari) dan VIP+ (1.000 req/hari) memberikan alokasi kuota harian yang jauh lebih besar, prioritas antrean terdepan, serta kecepatan respon maksimal untuk semua fitur downloader dan tools.'
            },
            {
              q: 'Bagaimana cara pembayaran dan aktivasinya?',
              a: 'Sistem menggunakan gateway pembayaran QRIS otomatis. Setelah Anda transfer sesuai total nominal unik, sistem langsung mendeteksi dan mengaktifkan paket VIP Anda secara instan.'
            }
          ].map((faq, i) => (
            <div key={i} className="shadow-lg p-4 rounded-none bg-white border-2 border-ink space-y-1.5">
              <h4 className="text-xs font-bold text-ink flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-forest" />
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-ink/65 font-medium leading-relaxed pl-5.5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};