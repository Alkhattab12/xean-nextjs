'use client';

import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { 
  Download, 
  Sparkles, 
  Grid, 
  Music, 
  History, 
  ShieldCheck, 
  Zap, 
  Menu, 
  X, 
  Layers,
  Code2,
  ExternalLink,
  CreditCard,
  User,
  LogOut
} from 'lucide-react';
import { useAuth } from '../utils/userContext';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  historyCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, tier, quotaUsed, quotaLimit, setShowAuthModal, logout } = useAuth();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string; highlight?: boolean }[] = [
    { id: 'downloader', label: 'Downloader HD', icon: <Download className="w-3.5 h-3.5" /> },
    { id: 'bulk-downloader', label: 'Unduhan Massal', icon: <Layers className="w-3.5 h-3.5 text-[#00FF88]" />, badge: 'Multi' },
    { id: 'all-tools', label: 'Pusat Fitur & Tools', icon: <Grid className="w-3.5 h-3.5" />, badge: '334+' },
    { id: 'pricing', label: 'Pricing', icon: <CreditCard className="w-3.5 h-3.5 text-[#00FF88]" />, badge: 'VIP', highlight: true },
    { id: 'ai-studio', label: 'AI Studio', icon: <Sparkles className="w-3.5 h-3.5 text-[#4F46E5]" />, badge: 'AI' },
    { id: 'spotify', label: 'Spotify Hub', icon: <Music className="w-3.5 h-3.5 text-[#00FF88]" /> },
    { id: 'services', label: 'Solusi Digital', icon: <Zap className="w-3.5 h-3.5 text-[#06B6D4]" /> },
    { id: 'history', label: 'Riwayat', icon: <History className="w-3.5 h-3.5" />, badge: historyCount > 0 ? String(historyCount) : undefined }
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050505]/90 border-b border-[#ffffff10] pt-[env(safe-area-inset-top)]">
      {/* Top micro banner */}
      <div className="bg-[#0A0A0A] px-4 py-1.5 text-xs text-[#888] border-b border-[#ffffff08] overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-semibold uppercase tracking-widest bg-[#1A1A1A] text-[#CCC] border border-[#ffffff10]">
              PROPRIETARY
            </span>
            <span className="truncate min-w-0 text-[11px] tracking-wide text-[#888]">
              Xean Digital • Advanced Digital Architecture & Universal Media Engine
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[10px] uppercase tracking-wider text-[#666] shrink-0">
            {/* Quota Indicator */}
            <div 
              onClick={() => setActiveTab('pricing')}
              className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#141414] hover:bg-[#202020] border border-white/10 text-[10px] font-mono text-[#AAA] transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${
                tier === 'vip_plus' ? 'bg-[#00FF88]' : tier === 'vip' ? 'bg-[#8B5CF6]' : 'bg-[#06B6D4]'
              } animate-pulse`}></span>
              <span className="uppercase text-white font-bold">{tier.replace('_', '+')}</span>
              <span className="text-[#666]">|</span>
              <span>{quotaUsed}/{quotaLimit} Req</span>
            </div>

            <span className="text-[#333]">|</span>

            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#00FF88]" />
              <span>Architect: <strong className="text-[#CCC] font-medium font-serif italic text-xs">Syamil Alkhattab</strong></span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div 
            id="brand-logo"
            onClick={() => setActiveTab('downloader')}
            className="flex flex-col cursor-pointer group select-none"
          >
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-light tracking-[0.2em] text-white">
                XEAN <span className="text-[#4F46E5] font-bold">DIGITAL</span>
              </h1>
              <span className="hidden md:inline-block text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#161616] text-[#888] border border-[#ffffff10]">
                V2.5
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-[#666] -mt-0.5">
              Advanced Digital Architecture
            </p>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-[11px] uppercase tracking-widest text-[#888]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 py-1.5 transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-white border-b-2 border-[#4F46E5] font-semibold'
                      : item.highlight 
                      ? 'text-[#00FF88] hover:text-white border-b-2 border-transparent font-medium'
                      : 'text-[#888] hover:text-white border-b-2 border-transparent'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                      item.highlight
                        ? 'bg-[#00FF88]/20 text-[#00FF88] border border-[#00FF88]/30 font-bold'
                        : isActive 
                        ? 'bg-[#4F46E5]/30 text-white border border-[#4F46E5]/50' 
                        : 'bg-[#1A1A1A] text-[#666] border border-[#ffffff08]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('pricing')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#111] hover:bg-[#1A1A1A] border border-white/10 text-xs text-white cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-[#00FF88]" />
                  <span className="font-mono text-[11px] font-bold truncate max-w-[100px]">{user.name || user.email.split('@')[0]}</span>
                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-full ${
                    tier === 'vip_plus' ? 'bg-[#00FF88]/20 text-[#00FF88]' : tier === 'vip' ? 'bg-[#8B5CF6]/20 text-[#C4B5FD]' : 'bg-white/10 text-[#888]'
                  }`}>
                    {tier}
                  </span>
                </button>
                <button
                  onClick={logout}
                  title="Keluar (Logout)"
                  className="p-2 rounded-full bg-[#141414] hover:bg-[#202020] text-[#888] hover:text-[#FF4444] border border-white/5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider px-3.5 py-2 rounded-full bg-[#111] hover:bg-[#1A1A1A] text-[#AAA] hover:text-white border border-[#ffffff10] transition-colors cursor-pointer"
              >
                <User className="w-3 h-3 text-[#00FF88]" />
                <span>Masuk / Akun</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('pricing')}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest px-4 py-2.5 rounded-full bg-gradient-to-r from-[#00FF88] to-[#06B6D4] text-black hover:opacity-90 shadow-xl transition-all active:scale-95 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Upgrade VIP</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setActiveTab('pricing')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#141414] border border-[#00FF88]/30 text-[10px] font-mono text-[#00FF88]"
            >
              <CreditCard className="w-3 h-3" />
              <span>{quotaUsed}/{quotaLimit}</span>
            </button>

            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#141414] text-[#CCC] hover:text-white border border-[#ffffff10] cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Hamburger Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#ffffff10] bg-[#0A0A0A]/98 backdrop-blur-2xl px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    item.id === 'pricing'
                      ? 'bg-gradient-to-r from-[#00FF88]/15 to-[#06B6D4]/15 text-[#00FF88] border border-[#00FF88]/30 font-bold'
                      : isActive
                      ? 'bg-[#4F46E5]/20 text-white border border-[#4F46E5]/40'
                      : 'bg-[#141414] text-[#888] hover:text-white border border-[#ffffff08]'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[9px] font-mono px-1.5 py-0.2 rounded bg-black/40 text-[#AAA]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Account status row */}
          <div className="p-3 rounded-2xl bg-[#121212] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#1C1C1C] border border-white/10 flex items-center justify-center text-[#00FF88]">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white leading-none truncate max-w-[140px]">
                  {user ? user.name || user.email : 'Tamu (Guest Plan)'}
                </p>
                <p className="text-[10px] text-[#888] font-mono mt-1">
                  Plan: <span className="text-[#00FF88] uppercase">{tier}</span> ({quotaUsed}/{quotaLimit} Req)
                </p>
              </div>
            </div>

            {user ? (
              <button
                onClick={logout}
                className="px-3 py-1 rounded-lg bg-[#201010] text-[#FF5555] text-xs font-mono border border-[#FF3344]/20 cursor-pointer"
              >
                Keluar
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowAuthModal(true);
                }}
                className="px-3 py-1 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Login
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-[#ffffff08] flex items-center justify-between text-xs text-[#777]">
            <span>Principal: <strong className="text-[#CCC] font-serif italic">Syamil Alkhattab</strong></span>
            <a 
              href="https://xeandigital.web.id" 
              target="_blank" 
              rel="noreferrer"
              className="text-[#4F46E5] hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};