'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { DownloadResult, DownloadOption } from '../types';
import { 
  Download, 
  Play, 
  ExternalLink, 
  Check, 
  Copy, 
  QrCode, 
  Sparkles, 
  FileVideo, 
  Music, 
  Image as ImageIcon, 
  Layers,
  Clock,
  User,
  ShieldCheck,
  Film,
  Eye,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadMediaFile } from '../utils/downloadHelper';

interface MediaResultCardProps {
  result: DownloadResult;
  onClear?: () => void;
}

export const MediaResultCard: React.FC<MediaResultCardProps> = ({ result, onClear }) => {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [formatFilter, setFormatFilter] = useState<'all' | 'video' | 'audio' | 'images'>('all');

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(id);
    toast.success('Tautan Berhasil Disalin', {
      description: 'URL unduhan media telah disalin ke clipboard.'
    });
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleDirectDownload = async (option: DownloadOption, index: number) => {
    const dlKey = `${option.label}-${index}`;
    setDownloadingId(dlKey);

    try {
      // Trigger festive celebratory confetti
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#3b82f6', '#10b981', '#a855f7']
      });

      const ext = option.format || (option.isAudio ? 'MP3' : 'MP4');
      await downloadMediaFile({
        url: option.url,
        title: result.title || result.platform,
        platform: result.platform,
        format: ext,
        isAudio: option.isAudio
      });
    } catch {
      // Handled inside downloadMediaFile
    } finally {
      setTimeout(() => setDownloadingId(null), 1000);
    }
  };

  // Filter downloads based on user filter tab
  const videoDownloads = result.downloads.filter(d => !d.isAudio && (d.format === 'MP4' || d.format === 'WEBM' || d.url.includes('.mp4') || !d.url.includes('.mp3')));
  const audioDownloads = result.downloads.filter(d => d.isAudio || d.format === 'MP3' || d.format === 'M4A' || d.url.includes('.mp3'));
  const imageDownloads = result.downloads.filter(d => d.format === 'JPG' || d.format === 'PNG' || d.format === 'WEBP');

  const filteredDownloads = 
    formatFilter === 'video' ? videoDownloads :
    formatFilter === 'audio' ? audioDownloads :
    formatFilter === 'images' ? imageDownloads :
    result.downloads;

  // Primary video URL for stream player
  const primaryVideoUrl = result.videoUrl || videoDownloads[0]?.url;

  // Resilient thumbnail URL with proxy fallback on CORS error
  const thumbnailSrc = imgError && result.thumbnail
    ? `/api/media-proxy?url=${encodeURIComponent(result.thumbnail)}&inline=true`
    : result.thumbnail;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    result.downloads[0]?.url || result.url
  )}`;

  return (
    <div className="w-full bg-[#0D0D0D] border border-[#ffffff12] rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
      {/* Background glowing gradient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#4F46E5]/10 to-[#06B6D4]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

      {/* Header Info */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#ffffff08] pb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#1A1A1A] text-white border border-[#ffffff15]">
            {result.platform}
          </span>
          <span className="text-xs text-[#888] flex items-center gap-1.5 font-light">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00FF88]" />
            Verified by Xean Architecture
          </span>
        </div>

        <div className="flex items-center gap-2">
          {primaryVideoUrl && (
            <button
              onClick={() => setShowVideoPlayer(!showVideoPlayer)}
              className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                showVideoPlayer 
                  ? 'bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white border-transparent shadow-lg shadow-[#4F46E5]/20 font-bold'
                  : 'bg-[#141414] hover:bg-[#1E1E1E] text-[#AAA] hover:text-white border-[#ffffff08]'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>{showVideoPlayer ? 'Tutup Stream' : 'Live Stream Video'}</span>
            </button>
          )}

          <button
            onClick={() => setShowQr(!showQr)}
            title="Scan QR for direct mobile download"
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full bg-[#141414] hover:bg-[#1E1E1E] text-[#AAA] hover:text-white border border-[#ffffff08] transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-[#888]" />
            <span className="hidden sm:inline">QR Mobile</span>
          </button>

          {onClear && (
            <button
              onClick={onClear}
              className="text-xs font-mono px-3 py-1.5 rounded-full bg-[#141414] hover:bg-[#FF3344]/20 text-[#666] hover:text-[#FF8888] border border-[#ffffff08] transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>

      {/* QR Code Modal Drawer */}
      {showQr && (
        <div className="mt-4 p-5 rounded-2xl bg-[#080808] border border-[#ffffff15] flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left animate-in fade-in duration-200">
          <div className="bg-white p-2.5 rounded-xl shadow-2xl">
            <img src={qrImageUrl} alt="QR Code" className="w-32 h-32" />
          </div>
          <div className="space-y-1.5 text-xs">
            <h4 className="font-bold text-sm text-white">Direct Mobile Transfer</h4>
            <p className="text-[#888] font-light leading-relaxed">
              Open your smartphone camera to scan this high-speed direct download link.
            </p>
            <button
              onClick={() => setShowQr(false)}
              className="mt-1 inline-block text-[#4F46E5] hover:underline font-mono text-[11px] cursor-pointer"
            >
              Close QR Code
            </button>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Media Preview & Player */}
        <div className="lg:col-span-5 space-y-3">
          {showVideoPlayer && primaryVideoUrl ? (
            /* Interactive Live Video Stream Player */
            <div className="relative rounded-2xl overflow-hidden bg-black border border-[#4F46E5]/40 shadow-2xl aspect-video">
              <video
                src={primaryVideoUrl}
                poster={thumbnailSrc}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                Browser Anda tidak mendukung pemutaran video langsung.
              </video>
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-mono text-[#00FF88] border border-white/10 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse"></span>
                <span>STREAM PREVIEW</span>
              </div>
            </div>
          ) : (
            /* Cover / Thumbnail Preview */
            <div className="relative rounded-2xl overflow-hidden bg-[#050505] border border-[#ffffff10] aspect-video flex items-center justify-center group shadow-inner">
              {thumbnailSrc ? (
                <img
                  src={thumbnailSrc}
                  alt={result.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#555] gap-2">
                  <FileVideo className="w-10 h-10 text-[#333]" />
                  <span className="text-xs font-mono">Stream Ready</span>
                </div>
              )}

              {/* Overlay Platform Badge */}
              <div className="absolute top-3 left-3 bg-[#050505]/85 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider text-white border border-[#ffffff15] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-ping"></span>
                <span>Extracted</span>
              </div>

              {/* Video Stream Play Button Overlay */}
              {primaryVideoUrl && (
                <button
                  onClick={() => setShowVideoPlayer(true)}
                  className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 hover:bg-white text-black shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-sm"
                  title="Play Video Stream"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              )}

              {result.duration && (
                <div className="absolute bottom-3 right-3 bg-[#050505]/90 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#AAA] flex items-center gap-1 border border-[#ffffff10]">
                  <Clock className="w-3 h-3 text-[#888]" />
                  <span>{result.duration}</span>
                </div>
              )}
            </div>
          )}

          {/* Audio Player if audio stream available */}
          {result.audioUrl && (
            <div className="p-3.5 rounded-2xl bg-[#080808] border border-[#ffffff08] space-y-2">
              <div className="flex items-center justify-between text-xs text-[#CCC]">
                <span className="flex items-center gap-1.5 font-medium">
                  <Music className="w-3.5 h-3.5 text-[#00FF88]" />
                  Direct Audio Stream
                </span>
                <span className="text-[10px] font-mono text-[#666]">320 kbps High-Bitrate</span>
              </div>
              <audio
                controls
                className="w-full h-8 accent-[#4F46E5]"
                src={result.audioUrl}
                preload="metadata"
              >
                Browser does not support audio playback.
              </audio>
            </div>
          )}
        </div>

        {/* Right Column: Title, Metadata, and Download Buttons */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-serif italic text-white font-normal leading-snug line-clamp-2">
              {result.title}
            </h3>

            <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs text-[#888]">
              {result.author && (
                <span className="flex items-center gap-1.5 bg-[#141414] px-3 py-1 rounded-full border border-[#ffffff08]">
                  <User className="w-3 h-3 text-[#888]" />
                  <span className="text-[#CCC] font-medium">{result.author}</span>
                </span>
              )}
              <span className="bg-[#141414] px-3 py-1 rounded-full border border-[#ffffff08] text-[#888] font-mono text-[11px]">
                {result.downloads.length} Pilihan Unduhan
              </span>
            </div>

            {result.caption && (
              <p className="mt-3 text-xs text-[#777] line-clamp-3 bg-[#080808] p-3 rounded-xl border border-[#ffffff08] leading-relaxed font-sans font-light">
                {result.caption}
              </p>
            )}
          </div>

          {/* Format Filter Tabs (Semua, Video MP4, Audio MP3, Galeri) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#050505] p-1 rounded-full border border-[#ffffff08] w-fit">
            <button
              onClick={() => setFormatFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                formatFilter === 'all'
                  ? 'bg-white text-black shadow-md font-semibold'
                  : 'text-[#888] hover:text-white'
              }`}
            >
              Semua ({result.downloads.length})
            </button>
            {videoDownloads.length > 0 && (
              <button
                onClick={() => setFormatFilter('video')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  formatFilter === 'video'
                    ? 'bg-gradient-to-r from-[#4F46E5] to-[#06B6D4] text-white shadow-md font-bold'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                <Film className="w-3 h-3" />
                <span>Video MP4 ({videoDownloads.length})</span>
              </button>
            )}
            {audioDownloads.length > 0 && (
              <button
                onClick={() => setFormatFilter('audio')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  formatFilter === 'audio'
                    ? 'bg-[#00FF88] text-black shadow-md font-bold'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                <Music className="w-3 h-3" />
                <span>Audio MP3 ({audioDownloads.length})</span>
              </button>
            )}
            {imageDownloads.length > 0 && (
              <button
                onClick={() => setFormatFilter('images')}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  formatFilter === 'images'
                    ? 'bg-white text-black shadow-md font-bold'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>Foto ({imageDownloads.length})</span>
              </button>
            )}
          </div>

          {/* Download Options Grid */}
          <div className="space-y-3 pt-1">
            <h4 className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#666] flex items-center justify-between">
              <span>Pilih Resolusi & Format Stream</span>
              <span className="text-[#888] font-normal">Ultra High-Speed Direct</span>
            </h4>

            {filteredDownloads.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#080808] border border-[#ffffff08] text-center text-xs text-[#888]">
                Tidak ada format yang sesuai dengan filter ini.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredDownloads.map((opt, idx) => {
                  const dlKey = `${opt.label}-${idx}`;
                  const isDownloading = downloadingId === dlKey;
                  const isCopied = copiedUrl === dlKey;
                  const isMp4 = opt.format === 'MP4' || opt.url.includes('.mp4') || (!opt.isAudio && opt.format !== 'JPG');

                  return (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-2xl bg-[#080808] border transition-all flex flex-col justify-between gap-3 group ${
                        isMp4 
                          ? 'border-[#ffffff10] hover:border-[#4F46E5]/50' 
                          : 'border-[#ffffff08] hover:border-[#ffffff18]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white group-hover:text-[#CCC] transition-colors truncate">
                            {opt.label}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                              isMp4 
                                ? 'bg-[#4F46E5]/15 text-[#818CF8] border-[#4F46E5]/30 font-bold' 
                                : opt.isAudio 
                                ? 'bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/30 font-bold'
                                : 'bg-[#161616] text-[#AAA] border-[#ffffff08]'
                            }`}>
                              {opt.format || (opt.isAudio ? 'MP3' : 'MP4')}
                            </span>
                            {opt.quality && (
                              <span className="text-[10px] text-[#888] font-mono">
                                {opt.quality}
                              </span>
                            )}
                            {opt.size && (
                              <span className="text-[10px] text-[#666] font-mono">
                                • {opt.size}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopy(opt.url, dlKey)}
                          title="Salin tautan stream langsung"
                          className="p-1.5 rounded-lg bg-[#141414] hover:bg-[#202020] text-[#666] hover:text-white transition-colors cursor-pointer shrink-0"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-[#00FF88]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDirectDownload(opt, idx)}
                          disabled={isDownloading}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ${
                            isMp4
                              ? 'bg-white hover:bg-gradient-to-r hover:from-[#4F46E5] hover:to-[#06B6D4] hover:text-white text-black shadow-white/5 font-extrabold'
                              : opt.isAudio
                              ? 'bg-[#00FF88] hover:bg-[#00E57A] text-black shadow-[#00FF88]/10'
                              : 'bg-white hover:bg-[#4F46E5] hover:text-white text-black shadow-white/5'
                          }`}
                        >
                          {isDownloading ? (
                            <>
                              <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                              <span>Memproses...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" />
                              <span>Unduh {opt.format || (opt.isAudio ? 'MP3' : 'MP4')}</span>
                            </>
                          )}
                        </button>

                        <a
                          href={opt.url}
                          target="_blank"
                          rel="noreferrer"
                          title="Buka atau stream di tab baru"
                          className="p-2.5 rounded-full bg-[#141414] hover:bg-[#202020] text-[#888] hover:text-white transition-colors border border-[#ffffff08]"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};