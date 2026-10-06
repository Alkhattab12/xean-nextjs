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
    { id: 'bulk-downloader', label: 'Unduhan Massal', icon: <Layers className="w-3.5 h-3.5 text-forest" />, badge: 'Multi' },
    { id: 'all-tools', label: 'Pusat Fitur & Tools', icon: <Grid className="w-3.5 h-3.5" />, badge: '334+' },
    { id: 'pricing', label: 'Pricing', icon: <CreditCard className="w-3.5 h-3.5 text-forest" />, badge: 'VIP', highlight: true },
    { id: 'ai-studio', label: 'AI Studio', icon: <Sparkles className="w-3.5 h-3.5 text-irisdeep" />, badge: 'AI' },
    { id: 'spotify', label: 'Spotify Hub', icon: <Music className="w-3.5 h-3.5 text-forest" /> },
    { id: 'services', label: 'Solusi Digital', icon: <Zap className="w-3.5 h-3.5 text-ocean" /> },
    { id: 'history', label: 'Riwayat', icon: <History className="w-3.5 h-3.5" />, badge: historyCount > 0 ? String(historyCount) : undefined }
  ];

  return (
    <header className="sticky top-0 z-50 bg-paper border-b-4 border-ink pt-[env(safe-area-inset-top)]">
      {/* Top micro banner */}
      <div className="bg-ink px-4 py-1.5 text-xs text-white overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold bg-volt text-ink">
              PROPRIETARY
            </span>
            <span className="truncate min-w-0 text-[11px] text-white/80">
              Xean Digital • Advanced Digital Architecture & Universal Media Engine
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-white/80 shrink-0">
            {/* Quota Indicator */}
            <div
              onClick={() => setActiveTab('pricing')}
              className="cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-white hover:bg-sun border-2 border-white text-[11px] font-mono text-ink transition-colors"
            >
              <span className={`w-2 h-2 rounded-full border border-ink ${
                tier === 'vip_plus' ? 'bg-volt' : tier === 'vip' ? 'bg-iris' : 'bg-sky'
              } animate-pulse`}></span>
              <span className="uppercase font-bold">{tier.replace('_', '+')}</span>
              <span className="text-ink/40">|</span>
              <span>{quotaUsed}/{quotaLimit} Req</span>
            </div>

            <span className="text-white/30">|</span>

            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-volt" />
              <span>Architect: <strong className="text-white font-extrabold font-serif text-xs">Syamil Alkhattab</strong></span>
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
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold tracking-tight text-ink leading-none">
                XEAN{' '}
                <span className="inline-block bg-iris border-2 border-ink px-1.5 -rotate-2 shadow-sm">DIGITAL</span>
              </h1>
              <span className="hidden md:inline-block text-[10px] font-mono font-bold px-1.5 py-0.5 bg-sun border-2 border-ink">
                V2.5
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-ink/70 font-medium mt-1.5">
              Advanced Digital Architecture
            </p>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-[12px] font-bold text-ink">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-2.5 py-1.5 border-2 cursor-pointer ${
                    isActive
                      ? 'bg-volt border-ink shadow-xs'
                      : item.highlight
                      ? 'bg-white border-ink hover:bg-sun'
                      : 'border-transparent hover:border-ink hover:bg-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-mono font-bold px-1.5 border-2 border-ink ${
                      item.highlight ? 'bg-volt' : isActive ? 'bg-white' : 'bg-paper'
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-white hover:bg-sun border-2 border-ink text-xs text-ink cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-forest" />
                  <span className="font-mono text-[11px] font-bold truncate max-w-[100px]">{user.name || user.email.split('@')[0]}</span>
                  <span className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded-none ${
                    tier === 'vip_plus' ? 'bg-volt/50 text-ink' : tier === 'vip' ? 'bg-iris/50 text-ink' : 'bg-ink/10 text-ink/65'
                  }`}>
                    {tier}
                  </span>
                </button>
                <button
                  onClick={logout}
                  title="Keluar (Logout)"
                  className="p-2 rounded-none bg-paper hover:bg-sun text-ink/65 hover:text-danger border-2 border-ink transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider px-3.5 py-2 rounded-none bg-white hover:bg-sun text-ink/80 hover:text-ink border-2 border-ink transition-colors cursor-pointer"
              >
                <User className="w-3 h-3 text-forest" />
                <span>Masuk / Akun</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('pricing')}
              className="flex items-center gap-2 text-[12px] font-extrabold px-4 py-2.5 bg-volt hover:bg-sun text-ink border-2 border-ink shadow-md cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Upgrade VIP</span>
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setActiveTab('pricing')}
              className="flex items-center gap-1 px-2.5 py-1 rounded-none bg-paper border-2 border-ink text-[11px] font-mono text-forest"
            >
              <CreditCard className="w-3 h-3" />
              <span>{quotaUsed}/{quotaLimit}</span>
            </button>

            <button
              id="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-none bg-paper text-ink/80 hover:text-ink border-2 border-ink cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Hamburger Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t-4 border-ink bg-paper px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-4 duration-200">
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
                  className={`flex items-center gap-2.5 px-3 py-2.5 border-2 border-ink shadow-sm text-xs font-bold cursor-pointer ${
                    item.id === 'pricing' ? 'bg-volt' : isActive ? 'bg-iris' : 'bg-white'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto text-[10px] font-mono px-1.5 py-0.2 bg-ink text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Account status row */}
          <div className="shadow-lg p-3 rounded-none bg-white border-2 border-ink flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-paper border-2 border-ink flex items-center justify-center text-forest">
                <User className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-ink leading-none truncate max-w-[140px]">
                  {user ? user.name || user.email : 'Tamu (Guest Plan)'}
                </p>
                <p className="text-[11px] text-ink/65 font-mono mt-1">
                  Plan: <span className="text-forest uppercase">{tier}</span> ({quotaUsed}/{quotaLimit} Req)
                </p>
              </div>
            </div>

            {user ? (
              <button
                onClick={logout}
                className="px-3 py-1 rounded-none bg-blush text-danger text-xs font-mono border-2 border-ink cursor-pointer"
              >
                Keluar
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowAuthModal(true);
                }}
                className="border-2 border-ink shadow-sm px-3 py-1 rounded-none bg-white text-black text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Login
              </button>
            )}
          </div>

          <div className="border-dashed pt-2 border-t border-ink flex items-center justify-between text-xs text-ink/65">
            <span>Principal: <strong className="text-ink/80 font-serif ">Syamil Alkhattab</strong></span>
            <a 
              href="https://xeandigital.web.id" 
              target="_blank" 
              rel="noreferrer"
              className="text-irisdeep hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              Portal <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};