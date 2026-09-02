'use client';

import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import { ActiveTab, DownloadResult, HistoryItem } from '../types';
import { AuthProvider, useAuth } from '../utils/userContext';
import { Navbar } from './Navbar';
import { HeroDownloader } from './HeroDownloader';
import { ToolsExplorer } from './ToolsExplorer';
import { AiStudio } from './AiStudio';
import { SpotifyHub } from './SpotifyHub';
import { DownloadHistory } from './DownloadHistory';
import { DigitalServicesHub } from './DigitalServicesHub';
import { BatchDownloader } from './BatchDownloader';
import { PricingView } from './PricingView';
import { AuthModal } from './AuthModal';
import { AgeVerificationModal } from './AgeVerificationModal';
import { CheckoutModal } from './CheckoutModal';
import { LimitReachedModal } from './LimitReachedModal';
import { Footer } from './Footer';
import { 
  Download, 
  Grid, 
  Sparkles, 
  Music, 
  Zap, 
  History,
  ShieldCheck,
  ExternalLink,
  Layers,
  CreditCard
} from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('downloader');
  const { recordRequestUsage } = useAuth();
  // NOTE (Next.js SSR adaptation): initialized empty (not read from localStorage
  // synchronously) because this component is server-rendered first; localStorage
  // does not exist on the server. Actual persisted history is hydrated in the
  // effect below, which only runs in the browser after mount.
  const [downloadHistory, setDownloadHistory] = useState<HistoryItem[]>([]);
  const [historyHydrated, setHistoryHydrated] = useState(false);

  // Hydrate history from localStorage after mount (client-only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xean_download_history');
      if (saved) setDownloadHistory(JSON.parse(saved));
    } catch (e) {
      console.warn('LocalStorage read failed:', e);
    } finally {
      setHistoryHydrated(true);
    }
  }, []);

  // Save history to localStorage (skip the very first render before hydration
  // completes, so we don't overwrite saved history with an empty array)
  useEffect(() => {
    if (!historyHydrated) return;
    try {
      localStorage.setItem('xean_download_history', JSON.stringify(downloadHistory));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [downloadHistory, historyHydrated]);

  const handleDownloadSuccess = (result: DownloadResult) => {
    const historyEntry: HistoryItem = {
      id: result.id,
      url: result.url,
      platform: result.platform,
      title: result.title,
      thumbnail: result.thumbnail,
      type: result.type,
      downloadUrl: result.downloads[0]?.url || result.url,
      timestamp: result.timestamp
    };

    setDownloadHistory((prev) => [historyEntry, ...prev.filter((i) => i.id !== result.id)].slice(0, 50));
  };

  const handleClearHistory = () => {
    setDownloadHistory([]);
    try {
      localStorage.removeItem('xean_download_history');
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-[#E0E0E0] font-sans selection:bg-[#4F46E5]/40 selection:text-white pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-0">
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={downloadHistory.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {activeTab === 'downloader' && (
          <HeroDownloader
            onDownloadSuccess={handleDownloadSuccess}
            recentResults={[]}
          />
        )}

        {activeTab === 'bulk-downloader' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
            <div className="text-center space-y-3 pt-4 pb-2">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#111111] border border-[#ffffff12] text-[#AAA] text-[11px] uppercase tracking-[0.3em] font-mono shadow-sm">
                <Layers className="w-3.5 h-3.5 text-[#00FF88]" />
                <span>Multi-Platform Batch Extraction</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-serif italic text-white font-normal">
                Unduhan Massal <span className="font-sans not-italic font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00FF88] to-[#06B6D4]">Multi-Tautan</span>
              </h2>
              <p className="text-xs sm:text-sm text-[#888] max-w-xl mx-auto font-light">
                Proses ekstraksi puluhan video, reel, audio stem, dan media sekaligus tanpa watermark dan unduh semua file dengan 1 kali klik.
              </p>
            </div>

            <BatchDownloader
              onProcessSingle={async (url, fmt) => {
                const canProceed = recordRequestUsage();
                if (!canProceed) return null;

                const res = await fetch('/api/download', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    url,
                    format: fmt === 'mp3' ? 'mp3' : undefined
                  })
                });
                const d = await res.json();
                return d.success ? d.result : null;
              }}
              onSingleSuccess={handleDownloadSuccess}
              onBatchComplete={(results) => {
                results.forEach(handleDownloadSuccess);
              }}
            />
          </div>
        )}

        {activeTab === 'pricing' && <PricingView />}

        {activeTab === 'all-tools' && <ToolsExplorer />}

        {activeTab === 'ai-studio' && <AiStudio />}

        {activeTab === 'spotify' && <SpotifyHub />}

        {activeTab === 'history' && (
          <DownloadHistory
            items={downloadHistory}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'services' && <DigitalServicesHub />}
      </main>

      {/* Mobile Floating Bottom Bar for Quick Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-2xl border-t border-[#ffffff10] px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] flex items-center justify-around text-[10px] text-[#888]">
        <button
          onClick={() => setActiveTab('downloader')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors ${
            activeTab === 'downloader' ? 'text-white font-bold' : 'hover:text-[#CCC]'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Downloader</span>
        </button>

        <button
          onClick={() => setActiveTab('all-tools')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors ${
            activeTab === 'all-tools' ? 'text-white font-bold' : 'hover:text-[#CCC]'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Tools (330+)</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors ${
            activeTab === 'pricing' ? 'text-[#00FF88] font-bold' : 'hover:text-[#CCC]'
          }`}
        >
          <CreditCard className="w-4 h-4 text-[#00FF88]" />
          <span className="text-[#00FF88]">Pricing VIP</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-studio')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors ${
            activeTab === 'ai-studio' ? 'text-[#4F46E5] font-bold' : 'hover:text-[#CCC]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-lg transition-colors ${
            activeTab === 'history' ? 'text-white font-bold' : 'hover:text-[#CCC]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Riwayat</span>
        </button>
      </nav>

      {/* Footer */}
      <Footer />

      {/* Global Modals */}
      <AuthModal />
      <AgeVerificationModal />
      <CheckoutModal />
      <LimitReachedModal onNavigateToPricing={() => setActiveTab('pricing')} />

      {/* Global Toast Notification System */}
      <Toaster 
        position="top-right" 
        theme="dark" 
        richColors 
        closeButton 
        toastOptions={{
          style: {
            background: '#0D0D0D',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: '#FFFFFF',
            fontFamily: 'inherit'
          }
        }}
      />
    </div>
  );
}

export function AppShell() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}