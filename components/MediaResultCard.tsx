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
    <div className="w-full bg-white border-2 border-ink rounded-none p-5 sm:p-7 shadow-2xl relative overflow-hidden isolate animate-in fade-in zoom-in-95 duration-300">
      {/* Background glowing gradient */}
      <div className="bg-iris border-2 border-ink absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none -mr-20 -mt-20 -z-10"></div>

      {/* Header Info */}
      <div className="border-dashed flex flex-wrap items-start justify-between gap-3 border-b border-ink pb-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-none text-xs font-mono font-bold uppercase tracking-wider bg-paper text-ink border-2 border-ink">
            {result.platform}
          </span>
          <span className="text-xs text-ink/65 flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-forest" />
            Verified by Xean Architecture
          </span>
        </div>

        <div className="flex items-center gap-2">
          {primaryVideoUrl && (
            <button
              onClick={() => setShowVideoPlayer(!showVideoPlayer)}
              className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-none border-2 transition-all cursor-pointer ${
                showVideoPlayer 
                  ? 'text-ink border-transparent shadow-lg font-bold'
                  : 'bg-paper hover:bg-sun text-ink/80 hover:text-ink border-ink shadow-sm'
              }`}
            >
              <Film className="w-3.5 h-3.5 text-ocean" />
              <span>{showVideoPlayer ? 'Tutup Stream' : 'Live Stream Video'}</span>
            </button>
          )}

          <button
            onClick={() => setShowQr(!showQr)}
            title="Scan QR for direct mobile download"
            className="flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-none bg-paper hover:bg-sun text-ink/80 hover:text-ink border-2 border-ink transition-colors"
          >
            <QrCode className="w-3.5 h-3.5 text-ink/65" />
            <span className="hidden sm:inline">QR Mobile</span>
          </button>

          {onClear && (
            <button
              onClick={onClear}
              className="text-xs font-mono px-3 py-1.5 rounded-none bg-paper hover:bg-alert/50 text-ink/65 hover:text-danger border-2 border-ink transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>

      {/* QR Code Modal Drawer */}
      {showQr && (
        <div className="shadow-lg mt-4 p-5 rounded-none bg-paper border-2 border-ink flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left animate-in fade-in duration-200">
          <div className="bg-white p-2.5 rounded-none border-2 border-ink shadow-lg">
            <img src={qrImageUrl} alt="QR Code" className="w-32 h-32" />
          </div>
          <div className="space-y-1.5 text-xs">
            <h4 className="font-bold text-sm text-ink">Direct Mobile Transfer</h4>
            <p className="text-ink/65 font-medium leading-relaxed">
              Open your smartphone camera to scan this high-speed direct download link.
            </p>
            <button
              onClick={() => setShowQr(false)}
              className="mt-1 inline-block text-irisdeep hover:underline font-mono text-[11px] cursor-pointer"
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
            <div className="relative rounded-none overflow-hidden bg-black border-2 border-ink shadow-lg aspect-video">
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
              <div className="absolute top-2 left-2 bg-ink/75 px-2 py-0.5 rounded-none text-[10px] font-mono text-volt border-2 border-ink flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse"></span>
                <span>STREAM PREVIEW</span>
              </div>
            </div>
          ) : (
            /* Cover / Thumbnail Preview */
            <div className="shadow-lg relative rounded-none overflow-hidden bg-paper border-2 border-ink aspect-video flex items-center justify-center group ">
              {thumbnailSrc ? (
                <img
                  src={thumbnailSrc}
                  alt={result.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-ink/55 gap-2">
                  <FileVideo className="w-10 h-10 text-ink/40" />
                  <span className="text-xs font-mono">Stream Ready</span>
                </div>
              )}

              {/* Overlay Platform Badge */}
              <div className="absolute top-3 left-3 bg-paper/85 px-2.5 py-1 rounded-none text-[11px] font-mono text-ink border-2 border-ink flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-volt animate-ping"></span>
                <span>Extracted</span>
              </div>

              {/* Video Stream Play Button Overlay */}
              {primaryVideoUrl && (
                <button
                  onClick={() => setShowVideoPlayer(true)}
                  className="border-2 border-ink absolute inset-0 m-auto w-12 h-12 rounded-full bg-white/90 hover:bg-white text-black shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer "
                  title="Play Video Stream"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </button>
              )}

              {result.duration && (
                <div className="absolute bottom-3 right-3 bg-paper/90 px-2.5 py-0.5 rounded-none text-[11px] font-mono text-ink/80 flex items-center gap-1 border-2 border-ink">
                  <Clock className="w-3 h-3 text-ink/65" />
                  <span>{result.duration}</span>
                </div>
              )}
            </div>
          )}

          {/* Audio Player if audio stream available */}
          {result.audioUrl && (
            <div className="shadow-lg p-3.5 rounded-none bg-paper border-2 border-ink space-y-2">
              <div className="flex items-center justify-between text-xs text-ink/80">
                <span className="flex items-center gap-1.5 font-medium">
                  <Music className="w-3.5 h-3.5 text-forest" />
                  Direct Audio Stream
                </span>
                <span className="text-[11px] font-mono text-ink/65">320 kbps High-Bitrate</span>
              </div>
              <audio
                controls
                className="w-full h-8 accent-iris"
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
            <h3 className="text-base sm:text-lg font-serif text-ink font-extrabold leading-snug line-clamp-2">
              {result.title}
            </h3>

            <div className="mt-2.5 flex flex-wrap items-center gap-2.5 text-xs text-ink/65">
              {result.author && (
                <span className="flex items-center gap-1.5 bg-paper px-3 py-1 rounded-none border-2 border-ink">
                  <User className="w-3 h-3 text-ink/65" />
                  <span className="text-ink/80 font-medium">{result.author}</span>
                </span>
              )}
              <span className="bg-paper px-3 py-1 rounded-none border-2 border-ink text-ink/65 font-mono text-[11px]">
                {result.downloads.length} Pilihan Unduhan
              </span>
            </div>

            {result.caption && (
              <p className="mt-3 text-xs text-ink/65 line-clamp-3 bg-paper p-3 rounded-none border-2 border-ink leading-relaxed font-sans font-medium">
                {result.caption}
              </p>
            )}
          </div>

          {/* Format Filter Tabs (Semua, Video MP4, Audio MP3, Galeri) */}
          <div className="flex flex-wrap items-center gap-1.5 bg-paper p-1 rounded-none border-2 border-ink w-fit">
            <button
              onClick={() => setFormatFilter('all')}
              className={`border-2 px-3 py-1 rounded-none text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                formatFilter === 'all'
                  ? 'bg-white text-black shadow-md font-semibold border-ink'
                  : 'text-ink/65 hover:text-ink border-transparent'
              }`}
            >
              Semua ({result.downloads.length})
            </button>
            {videoDownloads.length > 0 && (
              <button
                onClick={() => setFormatFilter('video')}
                className={`bg-iris flex items-center gap-1 px-3 py-1 rounded-none text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  formatFilter === 'video'
                    ? 'text-ink shadow-md font-bold border-transparent'
                    : 'text-ink/65 hover:text-ink border-transparent'
                }`}
              >
                <Film className="w-3 h-3" />
                <span>Video MP4 ({videoDownloads.length})</span>
              </button>
            )}
            {audioDownloads.length > 0 && (
              <button
                onClick={() => setFormatFilter('audio')}
                className={`border-2 flex items-center gap-1 px-3 py-1 rounded-none text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  formatFilter === 'audio'
                    ? 'bg-volt text-black shadow-md font-bold border-ink'
                    : 'text-ink/65 hover:text-ink border-transparent'
                }`}
              >
                <Music className="w-3 h-3" />
                <span>Audio MP3 ({audioDownloads.length})</span>
              </button>
            )}
            {imageDownloads.length > 0 && (
              <button
                onClick={() => setFormatFilter('images')}
                className={`border-2 flex items-center gap-1 px-3 py-1 rounded-none text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                  formatFilter === 'images'
                    ? 'bg-white text-black shadow-md font-bold border-ink'
                    : 'text-ink/65 hover:text-ink border-transparent'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>Foto ({imageDownloads.length})</span>
              </button>
            )}
          </div>

          {/* Download Options Grid */}
          <div className="space-y-3 pt-1">
            <h4 className="text-[11px] font-mono text-ink/65 flex items-center justify-between">
              <span>Pilih Resolusi & Format Stream</span>
              <span className="text-ink/65 font-normal">Ultra High-Speed Direct</span>
            </h4>

            {filteredDownloads.length === 0 ? (
              <div className="shadow-lg p-6 rounded-none bg-paper border-2 border-ink text-center text-xs text-ink/65">
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
                      className={`shadow-lg p-3.5 rounded-none bg-paper border-2 transition-all flex flex-col justify-between gap-3 group ${
                        isMp4 
                          ? 'border-ink' 
                          : 'border-ink'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-ink group-hover:text-ink/80 transition-colors truncate">
                            {opt.label}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-none border-2 ${
                              isMp4 
                                ? 'bg-iris/50 text-ink border-ink font-bold' 
                                : opt.isAudio 
                                ? 'bg-volt/50 text-ink border-ink font-bold'
                                : 'bg-paper text-ink/80 border-ink'
                            }`}>
                              {opt.format || (opt.isAudio ? 'MP3' : 'MP4')}
                            </span>
                            {opt.quality && (
                              <span className="text-[11px] text-ink/65 font-mono">
                                {opt.quality}
                              </span>
                            )}
                            {opt.size && (
                              <span className="text-[11px] text-ink/65 font-mono">
                                • {opt.size}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopy(opt.url, dlKey)}
                          title="Salin tautan stream langsung"
                          className="border-2 border-ink shadow-sm p-1.5 rounded-none bg-paper hover:bg-sun text-ink/65 hover:text-ink transition-colors cursor-pointer shrink-0"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDirectDownload(opt, idx)}
                          disabled={isDownloading}
                          className={`border-2 flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-none text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer ${
                            isMp4
                              ? 'bg-white hover:text-ink text-black shadow-white/5 font-extrabold border-ink shadow-sm'
                              : opt.isAudio
                              ? 'bg-volt hover:bg-volt text-black border-ink shadow-sm'
                              : 'bg-white hover:bg-iris hover:text-ink text-black shadow-white/5 border-ink shadow-sm'
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
                          className="p-2.5 rounded-none bg-paper hover:bg-sun text-ink/65 hover:text-ink transition-colors border-2 border-ink"
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