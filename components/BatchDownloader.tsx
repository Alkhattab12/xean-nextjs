'use client';

import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import { DownloadResult, DownloadOption } from '../types';
import { 
  Layers, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Trash2, 
  Upload, 
  Copy, 
  Check, 
  FileText, 
  ExternalLink, 
  Play, 
  Sparkles, 
  Video, 
  Music, 
  Filter, 
  RotateCcw,
  Clock,
  User,
  ShieldCheck,
  FileDown,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadMediaFile } from '../utils/downloadHelper';

interface BatchDownloaderProps {
  onProcessSingle: (url: string, format?: 'auto' | 'mp4' | 'mp3') => Promise<DownloadResult | null>;
  onBatchComplete?: (results: DownloadResult[]) => void;
  onSingleSuccess?: (result: DownloadResult) => void;
}

interface BatchQueueItem {
  id: string;
  url: string;
  platformName: string;
  status: 'pending' | 'processing' | 'success' | 'error';
  result?: DownloadResult;
  error?: string;
  selectedOptionIndex: number;
}

function detectPlatformFromUrl(url: string): string {
  const u = url.toLowerCase();
  if (u.includes('tiktok.com') || u.includes('douyin.com')) return 'TikTok';
  if (u.includes('instagram.com')) return 'Instagram';
  if (u.includes('youtube.com') || u.includes('youtu.be')) return 'YouTube';
  if (u.includes('facebook.com') || u.includes('fb.watch')) return 'Facebook';
  if (u.includes('twitter.com') || u.includes('x.com')) return 'Twitter / X';
  if (u.includes('spotify.com')) return 'Spotify';
  if (u.includes('terabox') || u.includes('1024tera')) return 'TeraBox';
  if (u.includes('mega.nz')) return 'MEGA.nz';
  if (u.includes('pinterest.com') || u.includes('pin.it')) return 'Pinterest';
  if (u.includes('capcut.com')) return 'CapCut';
  if (u.includes('bilibili.com') || u.includes('b23.tv')) return 'Bilibili';
  if (u.includes('soundcloud.com')) return 'SoundCloud';
  if (u.includes('drive.google.com')) return 'Google Drive';
  if (u.includes('mediafire.com')) return 'MediaFire';
  if (u.includes('music.apple.com')) return 'Apple Music';
  if (u.includes('threads.net')) return 'Threads';
  return 'Universal';
}

const SAMPLE_BATCH_URLS = [
  'https://www.tiktok.com/@scout2015/video/6718335390845095173',
  'https://www.instagram.com/reel/C8q8yV_sZ1p/',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT'
];

export const BatchDownloader: React.FC<BatchDownloaderProps> = ({
  onProcessSingle,
  onBatchComplete,
  onSingleSuccess
}) => {
  const [urlsText, setUrlsText] = useState('');
  const [queue, setQueue] = useState<BatchQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [batchFormat, setBatchFormat] = useState<'auto' | 'mp4' | 'mp3'>('auto');
  const [activeFilter, setActiveFilter] = useState<'all' | 'success' | 'error' | 'processing'>('all');
  const [copiedLinks, setCopiedLinks] = useState(false);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse valid URLs from current text input
  const extractedUrls = urlsText
    .split(/[\n,]/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith('http://') || l.startsWith('https://'));

  const handleStartBatch = async () => {
    if (extractedUrls.length === 0) return;

    const initialQueue: BatchQueueItem[] = extractedUrls.map((url, index) => ({
      id: `batch-${Date.now()}-${index}`,
      url,
      platformName: detectPlatformFromUrl(url),
      status: 'pending',
      selectedOptionIndex: 0
    }));

    setQueue(initialQueue);
    setIsProcessing(true);

    const completedResults: DownloadResult[] = [];
    const concurrencyLimit = 2; // Process 2 at a time for optimal speed & stability

    const processItem = async (index: number) => {
      setQueue((prev) =>
        prev.map((item, idx) => (idx === index ? { ...item, status: 'processing' } : item))
      );

      const targetItem = initialQueue[index];
      try {
        const res = await onProcessSingle(targetItem.url, batchFormat);
        if (res) {
          completedResults.push(res);
          if (onSingleSuccess) onSingleSuccess(res);

          setQueue((prev) =>
            prev.map((item, idx) =>
              idx === index ? { ...item, status: 'success', result: res } : item
            )
          );
        } else {
          setQueue((prev) =>
            prev.map((item, idx) =>
              idx === index
                ? { ...item, status: 'error', error: 'Gagal mengekstrak konten media dari link ini' }
                : item
            )
          );
        }
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((item, idx) =>
            idx === index
              ? { ...item, status: 'error', error: err.message || 'Gagal memproses media' }
              : item
          )
        );
      }
    };

    // Sequential / Chunked batch execution
    for (let i = 0; i < initialQueue.length; i += concurrencyLimit) {
      const chunk = [];
      for (let j = i; j < Math.min(i + concurrencyLimit, initialQueue.length); j++) {
        chunk.push(processItem(j));
      }
      await Promise.all(chunk);
    }

    setIsProcessing(false);

    if (completedResults.length > 0) {
      if (onBatchComplete) onBatchComplete(completedResults);
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#00FF88', '#4F46E5', '#06B6D4', '#FFFFFF']
      });
    }
  };

  // Retry failed items only
  const handleRetryFailed = async () => {
    const failedIndices = queue
      .map((item, idx) => (item.status === 'error' ? idx : -1))
      .filter((idx) => idx !== -1);

    if (failedIndices.length === 0) return;

    setIsProcessing(true);
    for (const idx of failedIndices) {
      setQueue((prev) =>
        prev.map((item, i) => (i === idx ? { ...item, status: 'processing', error: undefined } : item))
      );

      try {
        const res = await onProcessSingle(queue[idx].url, batchFormat);
        if (res) {
          if (onSingleSuccess) onSingleSuccess(res);
          setQueue((prev) =>
            prev.map((item, i) => (i === idx ? { ...item, status: 'success', result: res } : item))
          );
        } else {
          setQueue((prev) =>
            prev.map((item, i) => (i === idx ? { ...item, status: 'error', error: 'Gagal memproses' } : item))
          );
        }
      } catch (err: any) {
        setQueue((prev) =>
          prev.map((item, i) =>
            i === idx ? { ...item, status: 'error', error: err.message || 'Gagal memproses' } : item
          )
        );
      }
    }
    setIsProcessing(false);
  };

  // Bulk Download All Trigger with safety interval
  const handleDownloadAll = async () => {
    const successItems = queue.filter((item) => item.status === 'success' && item.result);
    if (successItems.length === 0) return;

    setIsDownloadingAll(true);
    const toastId = toast.loading('Memulai Unduhan Massal...', {
      description: `Menyiapkan ${successItems.length} berkas media untuk ditransfer ke perangkat...`
    });

    let completedCount = 0;

    for (let i = 0; i < successItems.length; i++) {
      const item = successItems[i];
      const res = item.result!;
      const selectedOpt: DownloadOption = res.downloads[item.selectedOptionIndex] || res.downloads[0] || {
        url: res.url,
        label: 'Download'
      };

      const ext = selectedOpt.format || (selectedOpt.isAudio ? 'MP3' : 'MP4');

      try {
        await downloadMediaFile({
          url: selectedOpt.url,
          title: `[${i + 1}/${successItems.length}] ${res.title || res.platform}`,
          platform: res.platform,
          format: ext,
          isAudio: selectedOpt.isAudio
        });
        completedCount++;
      } catch {
        // Continue with next
      }

      // Safe sleep delay to prevent browser download popup jamming
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    setIsDownloadingAll(false);
    toast.success('Unduhan Massal Selesai!', {
      id: toastId,
      description: `${completedCount} dari ${successItems.length} berkas telah berhasil dipicu untuk diunduh ke browser.`,
      duration: 5000
    });
  };

  // Copy all extracted stream URLs to clipboard (Great for IDM/JDownloader)
  const handleCopyAllLinks = () => {
    const successUrls = queue
      .filter((item) => item.status === 'success' && item.result)
      .map((item) => {
        const res = item.result!;
        const opt = res.downloads[item.selectedOptionIndex] || res.downloads[0];
        return opt ? opt.url : res.url;
      });

    if (successUrls.length === 0) return;

    navigator.clipboard.writeText(successUrls.join('\n'));
    setCopiedLinks(true);
    toast.success('Semua Tautan Berhasil Disalin', {
      description: `${successUrls.length} link download media siap ditempelkan di IDM / browser.`
    });
    setTimeout(() => setCopiedLinks(false), 2500);
  };

  // Export results as formatted text
  const handleExportText = () => {
    const successItems = queue.filter((item) => item.status === 'success' && item.result);
    if (successItems.length === 0) return;

    const content = successItems
      .map((item, idx) => {
        const res = item.result!;
        const opt = res.downloads[item.selectedOptionIndex] || res.downloads[0];
        return `[#${idx + 1}] ${res.platform.toUpperCase()} - ${res.title}\nLink Sumber: ${item.url}\nDownload Link: ${opt?.url || res.url}\n`;
      })
      .join('\n----------------------------------------\n\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xean_batch_download_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // File Upload Handling (.txt or .csv)
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setUrlsText((prev) => (prev.trim() ? `${prev.trim()}\n${text.trim()}` : text.trim()));
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleInsertSamples = () => {
    setUrlsText(SAMPLE_BATCH_URLS.join('\n'));
  };

  const handleClearAll = () => {
    setUrlsText('');
    setQueue([]);
  };

  // Metrics for queue
  const totalCount = queue.length;
  const successCount = queue.filter((i) => i.status === 'success').length;
  const errorCount = queue.filter((i) => i.status === 'error').length;
  const processingCount = queue.filter((i) => i.status === 'processing').length;
  const completedPercentage = totalCount > 0 ? Math.round(((successCount + errorCount) / totalCount) * 100) : 0;

  const filteredQueue = queue.filter((item) => {
    if (activeFilter === 'success') return item.status === 'success';
    if (activeFilter === 'error') return item.status === 'error';
    if (activeFilter === 'processing') return item.status === 'processing' || item.status === 'pending';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Unduhan Massal Control Board Card */}
      <div 
        onDragEnter={handleDrag}
        className={`bg-paper border-2 rounded-none p-5 sm:p-7 shadow-2xl transition-all relative ${
          dragActive ? 'border-ink shadow-xl bg-mint' : 'border-ink'
        }`}
      >
        {/* Header Title */}
        <div className="border-dashed flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-ink">
          <div className="flex items-center gap-3">
            <div className="shadow-lg w-10 h-10 rounded-none bg-paper border-2 border-ink flex items-center justify-center text-forest ">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-ink text-lg sm:text-xl font-extrabold">
                  Unduhan Massal Multi-URL
                </h3>
                <span className="px-2.5 py-0.5 rounded-none text-[11px] font-mono font-bold uppercase tracking-wider bg-paper text-forest border-2 border-ink">
                  Batch Pro
                </span>
              </div>
              <p className="text-xs text-ink/65 font-medium">
                Ekstrak dan download puluhan video TikTok, Reels, YouTube, dan Spotify sekaligus dalam satu klik.
              </p>
            </div>
          </div>

          {/* Quick Format Preference */}
          <div className="flex items-center gap-1.5 bg-paper p-1 rounded-none border-2 border-ink">
            <button
              onClick={() => setBatchFormat('auto')}
              className={`border-2 px-3 py-1 rounded-none text-[11px] font-mono transition-all ${
                batchFormat === 'auto'
                  ? 'bg-white text-black font-bold shadow-sm border-ink'
                  : 'text-ink/65 hover:text-ink border-transparent'
              }`}
            >
              Auto HD
            </button>
            <button
              onClick={() => setBatchFormat('mp4')}
              className={`border-2 flex items-center gap-1 px-3 py-1 rounded-none text-[11px] font-mono transition-all ${
                batchFormat === 'mp4'
                  ? 'bg-white text-black font-bold shadow-sm border-ink'
                  : 'text-ink/65 hover:text-ink border-transparent'
              }`}
            >
              <Video className="w-3 h-3" />
              <span>MP4</span>
            </button>
            <button
              onClick={() => setBatchFormat('mp3')}
              className={`border-2 flex items-center gap-1 px-3 py-1 rounded-none text-[11px] font-mono transition-all ${
                batchFormat === 'mp3'
                  ? 'bg-volt text-black font-bold shadow-sm border-ink'
                  : 'text-ink/65 hover:text-ink border-transparent'
              }`}
            >
              <Music className="w-3 h-3" />
              <span>MP3</span>
            </button>
          </div>
        </div>

        {/* Text Area & Input Zone */}
        <div className="space-y-3 pt-5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-mono text-ink/80 flex items-center gap-1.5">
              <span>Daftar Tautan Media</span>
              <span className="text-ink/65 font-normal">(1 baris per link URL)</span>
            </label>

            <div className="flex items-center gap-3">
              <button
                onClick={handleInsertSamples}
                className="text-[11px] font-mono text-forest hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Isi Contoh Link</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-mono text-ink/80 hover:text-ink flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload File .txt</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </div>
          </div>

          <div
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className="relative"
          >
            <textarea
              rows={5}
              value={urlsText}
              onChange={(e) => setUrlsText(e.target.value)}
              placeholder={`Tempelkan kumpulan link media di sini, contoh:\nhttps://www.tiktok.com/@user/video/...\nhttps://www.instagram.com/reel/...\nhttps://www.youtube.com/watch?v=...\nhttps://open.spotify.com/track/...`}
              className="shadow-lg w-full bg-paper border-2 border-ink rounded-none p-4 text-xs font-mono text-ink placeholder:text-ink/45 focus:outline-none transition-colors leading-relaxed"
            />

            {dragActive && (
              <div className="absolute inset-0 bg-mint/90 rounded-none border-2 border-dashed border-ink shadow-xl flex flex-col items-center justify-center text-ink pointer-events-none">
                <Upload className="w-8 h-8 text-forest mb-2 animate-bounce" />
                <span className="text-xs font-mono font-bold">Lepaskan file .txt / .csv di sini</span>
              </div>
            )}
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs font-mono text-ink/65">
              <span>Status Input:</span>
              <span className={`px-2.5 py-0.5 rounded-none text-[11px] font-bold ${
                extractedUrls.length > 0
                  ? 'bg-paper text-forest border-2 border-ink'
                  : 'bg-paper text-ink/65 border-2 border-ink'
              }`}>
                {extractedUrls.length} URL Terdeteksi
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {(urlsText || queue.length > 0) && (
                <button
                  onClick={handleClearAll}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-none bg-paper hover:bg-sun text-ink/65 hover:text-danger text-xs font-mono transition-colors border-2 border-ink cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Bersihkan</span>
                </button>
              )}

              <button
                onClick={handleStartBatch}
                disabled={isProcessing || extractedUrls.length === 0}
                className="border-2 border-ink flex items-center gap-2 px-7 py-3 rounded-none bg-white hover:bg-volt hover:text-black text-black font-bold text-xs uppercase tracking-widest shadow-xl active:scale-98 transition-all disabled:opacity-40 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Memproses Antrean ({completedPercentage}%)...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mulai Unduhan Massal</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Live Progress Bar & Stats */}
        {queue.length > 0 && (
          <div className="border-dashed mt-6 pt-5 border-t border-ink space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xs font-mono uppercase tracking-wider text-ink flex items-center gap-2 font-bold">
                  <span>Progres Antrean Massal</span>
                  <span className="text-[11px] text-forest">({completedPercentage}%)</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-ink/65 font-mono">
                  <span>Total: <strong className="text-ink">{totalCount}</strong></span>
                  <span>• Berhasil: <strong className="text-forest">{successCount}</strong></span>
                  {errorCount > 0 && <span>• Gagal: <strong className="text-danger">{errorCount}</strong></span>}
                  {processingCount > 0 && <span>• Berjalan: <strong className="text-irisdeep">{processingCount}</strong></span>}
                </div>
              </div>

              {/* Action Tools for Queue */}
              <div className="flex flex-wrap items-center gap-2">
                {errorCount > 0 && !isProcessing && (
                  <button
                    onClick={handleRetryFailed}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-blush hover:bg-blush text-danger text-xs font-mono border-2 border-ink transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Ulangi {errorCount} Gagal</span>
                  </button>
                )}

                {successCount > 0 && (
                  <>
                    <button
                      onClick={handleCopyAllLinks}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-paper hover:bg-sun text-ink/80 hover:text-ink text-xs font-mono border-2 border-ink transition-colors cursor-pointer"
                    >
                      {copiedLinks ? <Check className="w-3 h-3 text-forest" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLinks ? 'Tersalin' : 'Salin Semua Link'}</span>
                    </button>

                    <button
                      onClick={handleExportText}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-none bg-paper hover:bg-sun text-ink/80 hover:text-ink text-xs font-mono border-2 border-ink transition-colors cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Ekspor .txt</span>
                    </button>

                    <button
                      onClick={handleDownloadAll}
                      disabled={isDownloadingAll}
                      className="border-2 border-ink flex items-center gap-2 px-5 py-2 rounded-none bg-white hover:bg-volt text-black font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
                    >
                      {isDownloadingAll ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengunduh...</span>
                        </>
                      ) : (
                        <>
                          <FileDown className="w-3.5 h-3.5" />
                          <span>Unduh Semua File ({successCount})</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full h-2 rounded-none bg-paper overflow-hidden border-2 border-ink">
              <div
                className="bg-iris h-full transition-all duration-300 rounded-none"
                style={{ width: `${completedPercentage}%` }}
              ></div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[11px] font-mono text-ink/65 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              <button
                onClick={() => setActiveFilter('all')}
                className={`border-2 px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider transition-colors ${
                  activeFilter === 'all' ? 'bg-paper text-ink font-bold border-ink shadow-sm' : 'text-ink/65 hover:text-ink border-transparent'
                }`}
              >
                Semua ({totalCount})
              </button>
              <button
                onClick={() => setActiveFilter('success')}
                className={`border-2 px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider transition-colors ${
                  activeFilter === 'success' ? 'bg-volt/50 text-ink font-bold border-ink shadow-sm' : 'text-ink/65 hover:text-ink border-transparent'
                }`}
              >
                Berhasil ({successCount})
              </button>
              {errorCount > 0 && (
                <button
                  onClick={() => setActiveFilter('error')}
                  className={`border-2 px-3 py-1 rounded-none text-[11px] font-mono uppercase tracking-wider transition-colors ${
                    activeFilter === 'error' ? 'bg-alert/50 text-ink font-bold border-ink shadow-sm' : 'text-ink/65 hover:text-ink border-transparent'
                  }`}
                >
                  Gagal ({errorCount})
                </button>
              )}
            </div>

            {/* List of Queue Items */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredQueue.map((item, idx) => {
                const res = item.result;
                const opt = res ? (res.downloads[item.selectedOptionIndex] || res.downloads[0]) : null;

                return (
                  <div
                    key={item.id || idx}
                    className="shadow-lg p-4 rounded-none bg-paper border-2 border-ink transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Media Thumbnail & Meta */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {res?.thumbnail ? (
                        <img
                          src={res.thumbnail}
                          alt={res.title}
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (!target.src.includes('/api/media-proxy')) {
                              target.src = `/api/media-proxy?url=${encodeURIComponent(res.thumbnail || '')}&inline=true`;
                            }
                          }}
                          className="w-14 h-14 rounded-none object-cover border-2 border-ink shrink-0 shadow-md"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-none bg-white border-2 border-ink flex items-center justify-center text-ink shrink-0">
                          {item.platformName === 'Spotify' || item.platformName === 'SoundCloud' ? (
                            <Music className="w-6 h-6 text-forest" />
                          ) : (
                            <Video className="w-6 h-6 text-ink/65" />
                          )}
                        </div>
                      )}

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.2 rounded-none text-[10px] font-mono font-bold uppercase tracking-wider bg-paper text-ink/80 border-2 border-ink">
                            {item.platformName}
                          </span>
                          <span className="text-[11px] text-ink/55 font-mono truncate max-w-[200px] sm:max-w-xs">
                            {item.url}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-ink truncate max-w-sm sm:max-w-md">
                          {res?.title || item.url}
                        </h4>

                        {res?.author && (
                          <div className="text-[11px] text-ink/65 flex items-center gap-1 font-medium">
                            <User className="w-3 h-3 text-ink/65" />
                            <span>{res.author}</span>
                            {res.duration && <span>• {res.duration}</span>}
                          </div>
                        )}

                        {item.error && (
                          <p className="text-[11px] text-danger flex items-center gap-1 font-sans">
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            <span>{item.error}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status & Download Action */}
                    <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                      {item.status === 'pending' && (
                        <span className="text-xs font-mono text-ink/65 bg-white px-3 py-1.5 rounded-none border-2 border-ink">
                          Dalam Antrean
                        </span>
                      )}

                      {item.status === 'processing' && (
                        <span className="text-xs font-mono text-ink bg-iris/50 px-3.5 py-1.5 rounded-none border-2 border-ink flex items-center gap-1.5 font-medium animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Mengekstrak...</span>
                        </span>
                      )}

                      {item.status === 'error' && (
                        <button
                          onClick={async () => {
                            setQueue((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, status: 'processing', error: undefined } : i))
                            );
                            try {
                              const r = await onProcessSingle(item.url, batchFormat);
                              if (r) {
                                if (onSingleSuccess) onSingleSuccess(r);
                                setQueue((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, status: 'success', result: r } : i))
                                );
                              } else {
                                setQueue((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, status: 'error', error: 'Gagal diproses' } : i))
                                );
                              }
                            } catch (e: any) {
                              setQueue((prev) =>
                                prev.map((i) => (i.id === item.id ? { ...i, status: 'error', error: e.message } : i))
                              );
                            }
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-none bg-blush hover:bg-blush text-danger text-xs font-mono border-2 border-ink transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Coba Lagi</span>
                        </button>
                      )}

                      {item.status === 'success' && res && opt && (
                        <div className="flex items-center gap-2">
                          {res.downloads.length > 1 && (
                            <select
                              value={item.selectedOptionIndex}
                              onChange={(e) => {
                                const newIdx = parseInt(e.target.value, 10);
                                setQueue((prev) =>
                                  prev.map((i) => (i.id === item.id ? { ...i, selectedOptionIndex: newIdx } : i))
                                );
                              }}
                              className="bg-white text-[11px] font-mono text-ink border-2 border-ink rounded-none px-2.5 py-1.5 focus:outline-none cursor-pointer"
                            >
                              {res.downloads.map((d, dIdx) => (
                                <option key={dIdx} value={dIdx}>
                                  {d.label} {d.quality ? `(${d.quality})` : ''}
                                </option>
                              ))}
                            </select>
                          )}

                          <button
                            onClick={() => {
                              const ext = opt.format || (opt.isAudio ? 'MP3' : 'MP4');
                              downloadMediaFile({
                                url: opt.url,
                                title: res.title || res.platform,
                                platform: res.platform,
                                format: ext,
                                isAudio: opt.isAudio
                              });
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-none bg-white hover:bg-volt text-black font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh</span>
                          </button>

                          <a
                            href={opt.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-none bg-paper hover:bg-sun text-ink/65 hover:text-ink transition-colors border-2 border-ink"
                            title="Buka Link Langsung"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Helper Information Box */}
      <div className="shadow-lg p-5 rounded-none bg-paper border-2 border-ink text-xs text-ink/65 flex items-start gap-3.5">
        <Info className="w-4 h-4 text-forest shrink-0 mt-0.5" />
        <div className="space-y-1 font-medium leading-relaxed">
          <strong className="block text-ink font-medium">Tips Unduhan Massal:</strong>
          <p>
            Anda dapat menempelkan link dari berbagai platform campuran (misal 5 video TikTok + 3 Reel Instagram + 2 lagu Spotify) sekaligus. Sistem otomatis mengklasifikasikan mesin ekstraksi per tautan.
          </p>
        </div>
      </div>
    </div>
  );
};