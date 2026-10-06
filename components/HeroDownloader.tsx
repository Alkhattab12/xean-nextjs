'use client';

import React, { useState, useEffect } from 'react';
import { DownloadResult } from '../types';
import { PLATFORMS_LIST } from '../data/featuredTools';
import { MediaResultCard } from './MediaResultCard';
import { BatchDownloader } from './BatchDownloader';
import { useAuth } from '../utils/userContext';
import { 
  Download, 
  Sparkles, 
  Link2, 
  Clipboard, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Shield, 
  Zap, 
  AlertTriangle,
  FileCheck,
  Video,
  Music,
  HelpCircle
} from 'lucide-react';

interface HeroDownloaderProps {
  onDownloadSuccess: (result: DownloadResult) => void;
  recentResults: DownloadResult[];
}

export const HeroDownloader: React.FC<HeroDownloaderProps> = ({
  onDownloadSuccess,
  recentResults
}) => {
  const { user, recordRequestUsage } = useAuth();
  const [inputUrl, setInputUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<'auto' | 'mp4' | 'mp3'>('auto');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<DownloadResult | null>(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [detectedPlatform, setDetectedPlatform] = useState<string | null>(null);

  // Auto-detect platform from URL input
  useEffect(() => {
    const url = inputUrl.trim().toLowerCase();
    if (!url) {
      setDetectedPlatform(null);
      return;
    }
    if (url.includes('tiktok.com') || url.includes('douyin.com')) setDetectedPlatform('TikTok');
    else if (url.includes('instagram.com')) setDetectedPlatform('Instagram');
    else if (url.includes('youtube.com') || url.includes('youtu.be')) setDetectedPlatform('YouTube');
    else if (url.includes('facebook.com') || url.includes('fb.watch')) setDetectedPlatform('Facebook');
    else if (url.includes('twitter.com') || url.includes('x.com')) setDetectedPlatform('X / Twitter');
    else if (url.includes('spotify.com')) setDetectedPlatform('Spotify');
    else if (url.includes('terabox') || url.includes('1024tera')) setDetectedPlatform('TeraBox');
    else if (url.includes('mega.nz')) setDetectedPlatform('MEGA.nz');
    else if (url.includes('pinterest.com') || url.includes('pin.it')) setDetectedPlatform('Pinterest');
    else if (url.includes('capcut.com')) setDetectedPlatform('CapCut');
    else if (url.includes('bilibili.com') || url.includes('b23.tv')) setDetectedPlatform('Bilibili');
    else if (url.includes('github.com')) setDetectedPlatform('GitHub');
    else if (url.includes('drive.google.com')) setDetectedPlatform('Google Drive');
    else if (url.includes('mediafire.com')) setDetectedPlatform('MediaFire');
    else if (url.includes('soundcloud.com')) setDetectedPlatform('SoundCloud');
    else if (url.includes('music.apple.com')) setDetectedPlatform('Apple Music');
    else if (url.includes('threads.net')) setDetectedPlatform('Threads');
    else if (url.includes('videy.co')) setDetectedPlatform('Videy');
    else if (url.includes('npmjs.com')) setDetectedPlatform('NPM');
    else setDetectedPlatform('Universal Media');
  }, [inputUrl]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputUrl(text.trim());
        setErrorMessage(null);
      }
    } catch (err) {
      console.warn('Clipboard read failed:', err);
    }
  };

  const handleFetchDownload = async (customUrl?: string) => {
    const targetUrl = (customUrl || inputUrl).trim();
    if (!targetUrl) {
      setErrorMessage('Silakan tempel atau ketik link video/media terlebih dahulu.');
      return;
    }

    const canProceed = await recordRequestUsage();
    if (!canProceed) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (user) {
        headers['x-user-id'] = user.id;
        headers['x-user-tier'] = user.tier;
      }

      const response = await fetch('/api/download', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          url: targetUrl,
          platform: selectedPlatform !== 'all' ? selectedPlatform : undefined,
          format: selectedFormat === 'mp3' ? 'mp3' : undefined
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses media. Pastikan URL publik dan valid.');
      }

      setCurrentResult(data.result);
      onDownloadSuccess(data.result);
    } catch (err: any) {
      console.error('Download error:', err);
      setErrorMessage(err.message || 'Terjadi gangguan saat mengambil data. Silakan coba link lain.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Header Presentation */}
      <div className="relative max-w-4xl mx-auto pt-6 sm:pt-12 pb-2 space-y-6">
        {/* Gugus bentuk abstrak (tampil di semua ukuran layar) */}
        <div aria-hidden="true" className="pointer-events-none absolute right-0 top-6 sm:top-12 flex items-center">
          <span className="block w-8 h-8 sm:w-14 sm:h-14 rounded-full bg-volt border-2 border-ink"></span>
          <span className="block w-8 h-8 sm:w-14 sm:h-14 -ml-2 rotate-12 bg-pink border-2 border-ink"></span>
          <svg className="block w-8 h-8 sm:w-14 sm:h-14 -ml-2" viewBox="0 0 40 40">
            <polygon points="20,3 37,36 3,36" fill="#ffd84d" stroke="#000" strokeWidth="3" />
          </svg>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border-2 border-ink text-ink text-xs font-mono font-bold shadow-sm -rotate-2">
          <Sparkles className="w-3.5 h-3.5 text-irisdeep" />
          <span>Universal Digital Extraction Suite</span>
        </div>

        <h1 className="font-serif font-extrabold text-ink text-5xl sm:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
          Download Anything,
          <span className="block mt-3">
            <span className="inline-block bg-sun border-4 border-ink px-3 sm:px-4 py-1 shadow-xl -rotate-1">
              Without Boundaries
            </span>
          </span>
        </h1>

        <p className="text-sm sm:text-base text-ink/80 max-w-2xl leading-relaxed font-medium">
          High-fidelity extraction for TikTok (No Watermark), Instagram Reels, YouTube 4K & MP3, Spotify 320kbps, TeraBox, Twitter/X, and 330+ integrations powered by Xean Digital.
        </p>
      </div>

      {/* Main Input Box Card */}
      <div className="max-w-4xl mx-auto bg-white border-2 border-ink rounded-none p-5 sm:p-8 shadow-2xl relative">
        {/* Mode Selector Tabs: Single vs Unduhan Massal */}
        <div className="border-dashed flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-ink">
          <div className="flex items-center gap-1.5 bg-paper p-1.5 rounded-none border-2 border-ink">
            <button
              onClick={() => setIsBatchMode(false)}
              className={`border-2 flex items-center gap-2 px-4 py-2 rounded-none text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                !isBatchMode
                  ? 'bg-white text-black shadow-md border-ink'
                  : 'text-ink/65 hover:text-ink border-transparent'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Link Tunggal</span>
            </button>
            <button
              onClick={() => setIsBatchMode(true)}
              className={`bg-iris flex items-center gap-2 px-4 py-2 rounded-none text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                isBatchMode
                  ? 'text-ink shadow-lg font-bold border-transparent'
                  : 'text-ink/65 hover:text-ink border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Unduhan Massal</span>
              <span className="px-1.5 py-0.2 rounded-none bg-volt text-black text-[10px] font-bold font-mono">
                Multi
              </span>
            </button>
          </div>

          {!isBatchMode && (
            <div className="flex items-center gap-1.5 bg-paper p-1 rounded-none border-2 border-ink">
              <button
                onClick={() => setSelectedFormat('auto')}
                className={`border-2 px-3 py-1 rounded-none text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  selectedFormat === 'auto'
                    ? 'bg-white text-black shadow-md font-semibold border-ink'
                    : 'text-ink/65 hover:text-ink border-transparent'
                }`}
              >
                Auto HD
              </button>
              <button
                onClick={() => setSelectedFormat('mp4')}
                className={`border-2 flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  selectedFormat === 'mp4'
                    ? 'bg-white text-black shadow-md font-semibold border-ink'
                    : 'text-ink/65 hover:text-ink border-transparent'
                }`}
              >
                <Video className="w-3 h-3" />
                <span>MP4</span>
              </button>
              <button
                onClick={() => setSelectedFormat('mp3')}
                className={`border-2 flex items-center gap-1.5 px-3 py-1 rounded-none text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  selectedFormat === 'mp3'
                    ? 'bg-volt text-black shadow-md font-semibold border-ink'
                    : 'text-ink/65 hover:text-ink border-transparent'
                }`}
              >
                <Music className="w-3 h-3" />
                <span>MP3</span>
              </button>
            </div>
          )}
        </div>

        {/* Conditional View: Batch Mode vs Single URL */}
        {isBatchMode ? (
          <BatchDownloader
            onProcessSingle={async (url, fmt) => {
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
            onSingleSuccess={(result) => {
              onDownloadSuccess(result);
            }}
            onBatchComplete={(results) => {
              if (results.length > 0) {
                setCurrentResult(results[0]);
              }
            }}
          />
        ) : (
          <div className="space-y-4">
            {/* Input Bar */}
            <div className="shadow-lg relative flex flex-col sm:flex-row items-stretch gap-2 bg-paper border-2 border-ink rounded-none sm:rounded-none p-2 transition-all ">
              <div className="flex-1 flex items-center gap-3 px-4 py-2 sm:py-1">
                <Link2 className="w-4 h-4 text-ink/65 shrink-0" />
                <input
                  type="text"
                  id="media-url-input"
                  value={inputUrl}
                  onChange={(e) => {
                    setInputUrl(e.target.value);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFetchDownload();
                  }}
                  placeholder="Paste media link here (Instagram, TikTok, YouTube, Spotify, etc)..."
                  className="w-full bg-transparent text-sm sm:text-base text-ink placeholder:text-ink/45 focus:outline-none font-sans"
                />

                {detectedPlatform && (
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-none text-[11px] font-mono font-semibold bg-paper text-ink/80 border-2 border-ink shrink-0">
                    {detectedPlatform}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 px-1">
                <button
                  type="button"
                  id="paste-clipboard-btn"
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-none bg-paper hover:bg-sun text-ink/80 hover:text-ink text-xs font-semibold uppercase tracking-wider border-2 border-ink transition-colors"
                >
                  <Clipboard className="w-3.5 h-3.5 text-ink/65" />
                  <span className="hidden sm:inline">Paste</span>
                </button>

                <button
                  type="button"
                  id="start-download-btn"
                  onClick={() => handleFetchDownload()}
                  disabled={isLoading || !inputUrl.trim()}
                  className="border-2 border-ink flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-3 rounded-none bg-white hover:bg-iris hover:text-ink disabled:opacity-40 text-black font-bold text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div className="shadow-lg p-4 rounded-none bg-blush border-2 border-ink text-danger text-xs flex items-start gap-3 animate-in fade-in duration-200">
                <AlertTriangle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-ink">Extraction Notice</div>
                  <div className="text-ink/80 mt-0.5">{errorMessage}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Platform Quick Chips */}
        <div className="border-dashed mt-6 pt-5 border-t border-ink">
          <div className="text-[11px] font-mono text-ink/65 mb-3 flex items-center justify-between">
            <span>Verified Integration Hub</span>
            <span className="text-ink/65">25+ Popular Platforms</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PLATFORMS_LIST.map((plat) => {
              const isSelected = selectedPlatform === plat.id;
              return (
                <button
                  key={plat.id}
                  onClick={() => setSelectedPlatform(plat.id)}
                  className={`border-2 flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[11px] font-medium transition-all ${
                    isSelected
                      ? 'bg-white text-black shadow-sm font-semibold border-ink'
                      : 'bg-white text-ink/65 hover:text-ink hover:bg-sun border-2 border-ink shadow-sm'
                  }`}
                >
                  <span>{plat.name}</span>
                  {plat.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-none bg-paper text-ink/65">
                      {plat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Result Preview Card */}
      {currentResult && (
        <div className="max-w-4xl mx-auto">
          <MediaResultCard
            result={currentResult}
            onClear={() => setCurrentResult(null)}
          />
        </div>
      )}

      {/* Feature Highlights Bento Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
        <div className="shadow-lg p-6 rounded-none bg-white border-2 border-ink transition-all space-y-3">
          <div className="w-10 h-10 rounded-none bg-paper border-2 border-ink flex items-center justify-center text-ink">
            <Zap className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-ink text-sm tracking-wide">High-Throughput Direct Proxy</h4>
          <p className="text-xs text-ink/65 leading-relaxed font-medium">
            Engineered with zero throttling to stream 4K/1080p video, audio stems, and large archive binaries with instant initiation.
          </p>
        </div>

        <div className="shadow-lg p-6 rounded-none bg-white border-2 border-ink transition-all space-y-3">
          <div className="w-10 h-10 rounded-none bg-paper border-2 border-ink flex items-center justify-center text-forest">
            <Shield className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-ink text-sm tracking-wide">Sanitized Private Architecture</h4>
          <p className="text-xs text-ink/65 leading-relaxed font-medium">
            Crafted under Syamil Alkhattab's private architectural standards—all backend credentials remain concealed and encrypted.
          </p>
        </div>

        <div className="shadow-lg p-6 rounded-none bg-white border-2 border-ink transition-all space-y-3">
          <div className="w-10 h-10 rounded-none bg-paper border-2 border-ink flex items-center justify-center text-irisdeep">
            <FileCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-ink text-sm tracking-wide">Complete Digital Ecosystem</h4>
          <p className="text-xs text-ink/65 leading-relaxed font-medium">
            Access 330+ digital endpoints, AI image & text generators, Spotify high-bitrate audio stems, and developer utilities.
          </p>
        </div>
      </div>
    </div>
  );
};