'use client';

import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Pause,
  Check, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Sliders,
  Share2,
  Eye,
  User,
  Music,
  Video,
  FileText,
  BookOpen,
  Calendar,
  Layers,
  Palette,
  Bot,
  Film,
  Compass,
  Star,
  Clock,
  ThumbsUp,
  Radio,
  Tv,
  Globe,
  Newspaper,
  ShieldCheck,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../utils/userContext';

interface InteractiveToolModalProps {
  tool: {
    id: string;
    name: string;
    description: string;
    fullPath?: string;
    path?: string;
    endpointPath?: string;
    method?: string;
    category?: string;
    parameters?: any[];
    fields?: any[];
  } | null;
  onClose: () => void;
}

// Helper to extract YouTube video ID from URL or string
function extractYouTubeId(urlOrId: string): string | null {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const clean = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;
  
  const match = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
}

// Translate common parameter names to friendly Indonesian labels
function getFriendlyParamLabel(name: string, originalLabel?: string): string {
  if (originalLabel && originalLabel !== name) return originalLabel;
  const n = name.toLowerCase();

  if (n === 'text' || n === 'text1') return 'Teks Utama / Teks 1';
  if (n === 'text2') return 'Teks Tambahan / Teks 2 (Opsional)';
  if (n === 'text3') return 'Teks 3 (Opsional)';
  if (n === 'prompt') return 'Deskripsi / Prompt AI yang diinginkan';
  if (n === 'url' || n === 'link') return 'Link / URL Target';
  if (n === 'username' || n === 'user') return 'Username Akun (tanpa @)';
  if (n === 'query' || n === 'q' || n === 'search') return 'Kata Kunci Pencarian';
  if (n === 'city' || n === 'kota') return 'Nama Kota / Wilayah (contoh: Jakarta)';
  if (n === 'surah') return 'Nomor Surah Al-Quran (1-114)';
  if (n === 'ayat') return 'Nomor Ayat';
  if (n === 'style' || n === 'model') return 'Gaya / Model Pilihan';
  if (n === 'apikey') return 'API Key (Otomatis Diisi)';

  return name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' ');
}

function getFriendlyPlaceholder(name: string, example?: any): string {
  if (example !== undefined && example !== '') return `Contoh: ${example}`;
  const n = name.toLowerCase();

  if (n === 'text' || n === 'text1') return 'Ketik teks logo atau tulisan yang ingin dibuat...';
  if (n === 'text2') return 'Ketik teks baris kedua...';
  if (n === 'prompt') return 'Contoh: Cyberpunk samurai cat in neon tokyo street, 8k photorealistic...';
  if (n === 'url' || n === 'link') return 'Tempelkan link URL di sini...';
  if (n === 'username') return 'Contoh: syamilalkhattab';
  if (n === 'query' || n === 'q') return 'Ketik kata kunci pencarian...';
  if (n === 'city') return 'Contoh: Jakarta / Surabaya / Bandung';

  return `Masukkan ${name}...`;
}

export const InteractiveToolModal: React.FC<InteractiveToolModalProps> = ({
  tool,
  onClose
}) => {
  if (!tool) return null;

  const targetPath = tool.fullPath || tool.endpointPath || tool.path || '';

  // Build initial form parameters
  const initialParams: Record<string, any> = {};
  if (tool.fields) {
    tool.fields.forEach((f) => {
      initialParams[f.name] = f.defaultValue !== undefined ? f.defaultValue : '';
    });
  } else if (tool.parameters) {
    tool.parameters.forEach((p) => {
      if (p.name !== 'apikey') {
        initialParams[p.name] = p.default !== undefined ? p.default : (p.example !== undefined ? p.example : '');
      }
    });
  }

  const { user, recordRequestUsage } = useAuth();
  const [formValues, setFormValues] = useState<Record<string, any>>(initialParams);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedResult, setCopiedResult] = useState(false);
  const [activeVideoModal, setActiveVideoModal] = useState<{ url?: string; title?: string; youtubeId?: string } | null>(null);

  const handleInputChange = (key: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleExecute = async () => {
    const canProceed = await recordRequestUsage();
    if (!canProceed) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);
    setActiveVideoModal(null);

    try {
      let fetchUrl = '/api/xean-service';
      const authHeaders: Record<string, string> = {};
      if (user) {
        authHeaders['x-user-id'] = user.id;
        authHeaders['x-user-tier'] = user.tier;
      }

      let fetchOptions: RequestInit = { headers: authHeaders };

      const method = (tool.method || 'GET').toUpperCase();

      if (method === 'GET') {
        const params = new URLSearchParams();
        params.append('path', targetPath);
        for (const [k, v] of Object.entries(formValues)) {
          if (v !== undefined && v !== '' && k !== 'apikey') {
            params.append(k, String(v));
          }
        }
        fetchUrl += `?${params.toString()}`;
        fetchOptions = { method: 'GET', headers: authHeaders };
      } else {
        fetchOptions = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders },
          body: JSON.stringify({
            path: targetPath,
            ...formValues
          })
        };
      }

      const response = await fetch(fetchUrl, fetchOptions);
      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('image/')) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        setResult({ type: 'image_blob', url: objectUrl });
      } else {
        const data = await response.json().catch(() => null);
        if (!response.ok || !data) {
          const errStr =
            (typeof data?.error === 'string' ? data.error : data?.error?.message) ||
            (typeof data?.data?.error === 'string' ? data.data.error : data?.data?.error?.message) ||
            data?.message ||
            data?.msg ||
            'Gagal memproses fitur. Pastikan input yang dimasukkan valid.';
          throw new Error(errStr);
        }

        if (data.status === 'error' || data.success === false || data.data?.success === false) {
          const errStr =
            (typeof data?.error === 'string' ? data.error : data?.error?.message) ||
            (typeof data?.data?.error === 'string' ? data.data.error : data?.data?.error?.message) ||
            data?.message ||
            data?.msg;
          if (errStr) {
            throw new Error(errStr);
          }
        }

        setResult(data);
      }

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#00FF88', '#4F46E5', '#FFFFFF']
      });
    } catch (err: any) {
      console.error('Feature execution error:', err);
      setErrorMessage(
        typeof err.message === 'string' && err.message !== '[object Object]'
          ? err.message
          : 'Terjadi kendala saat memproses fitur. Pastikan parameter input terisi dengan format yang benar.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = (textToCopy: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  // Determine parameter inputs, excluding 'apikey'
  const rawParamList = tool.fields || tool.parameters || [];
  const paramList = rawParamList.filter((p: any) => p.name !== 'apikey');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white border-2 border-ink rounded-none shadow-2xl overflow-hidden">
        {/* Studio Header */}
        <div className="border-dashed p-6 border-b border-ink flex items-start justify-between gap-4 bg-paper">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-none text-[11px] font-mono font-bold uppercase tracking-wider bg-paper text-forest border-2 border-ink flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Fitur Siap Pakai</span>
              </span>
              <span className="text-xs text-ink/65 font-medium">
                Xean Studio
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-ink font-extrabold">
              {tool.name}
            </h3>
            <p className="text-xs text-ink/65 font-medium leading-relaxed max-w-xl">
              {tool.description}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-none bg-paper hover:bg-sun text-ink/65 hover:text-ink transition-colors border-2 border-ink cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Studio Body: Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
          {/* Input Form Section */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono text-ink/80 flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-irisdeep" />
              <span>Pengaturan & Input Fitur</span>
            </h4>

            {paramList.length === 0 ? (
              <div className="shadow-lg text-xs text-ink/80 bg-paper p-4 rounded-none border-2 border-ink flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-forest shrink-0" />
                <span>Fitur ini siap langsung dijalankan tanpa perlu konfigurasi tambahan. Klik tombol di bawah.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {paramList.map((param: any, idx: number) => {
                  const paramName = param.name;
                  const label = getFriendlyParamLabel(paramName, param.label);
                  const placeholder = getFriendlyPlaceholder(paramName, param.example || param.placeholder);
                  const isRequired = param.required;

                  return (
                    <div key={idx} className="space-y-1.5">
                      <label className="block text-xs font-medium text-ink flex items-center justify-between">
                        <span>
                          {label} {isRequired && <span className="text-danger">*</span>}
                        </span>
                        {param.description && (
                          <span className="text-[11px] text-ink/65 font-medium hidden sm:inline">
                            {param.description}
                          </span>
                        )}
                      </label>

                      {param.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={formValues[paramName] || ''}
                          onChange={(e) => handleInputChange(paramName, e.target.value)}
                          placeholder={placeholder}
                          className="shadow-lg w-full bg-paper border-2 border-ink rounded-none p-3.5 text-xs text-ink placeholder:text-ink/45 focus:outline-none font-sans"
                        />
                      ) : param.enum || param.options ? (
                        <select
                          value={formValues[paramName] || ''}
                          onChange={(e) => handleInputChange(paramName, e.target.value)}
                          className="w-full bg-paper border-2 border-ink rounded-none px-4 py-3 text-xs text-ink focus:outline-none cursor-pointer"
                        >
                          {(param.enum || param.options).map((opt: any, oIdx: number) => {
                            const val = typeof opt === 'object' ? opt.value : opt;
                            const lbl = typeof opt === 'object' ? opt.label : opt;
                            return (
                              <option key={oIdx} value={val} className="bg-white text-ink">
                                {lbl}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <input
                          type={param.type === 'number' ? 'number' : 'text'}
                          value={formValues[paramName] || ''}
                          onChange={(e) => handleInputChange(paramName, e.target.value)}
                          placeholder={placeholder}
                          className="w-full bg-paper border-2 border-ink rounded-none px-4 py-3 text-xs text-ink placeholder:text-ink/45 focus:outline-none"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Trigger Button */}
          <div className="pt-2">
            <button
              onClick={handleExecute}
              disabled={isLoading}
              className="border-2 border-ink w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-none bg-white hover:bg-iris hover:text-ink disabled:opacity-40 text-black font-bold text-xs uppercase tracking-widest shadow-md transition-all active:scale-98 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-current" />
                  <span>Sedang Memproses & Menghasilkan Media...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>✨ Jalankan & Proses Fitur</span>
                </>
              )}
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="shadow-lg p-4 rounded-none bg-blush border-2 border-ink text-danger text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
              <div>
                <strong className="block text-ink">Pemberitahuan:</strong>
                <span className="text-ink/80">{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Active Dedicated Video Player Modal if User Clicks 'Tonton Video' */}
          {activeVideoModal && (
            <div className="p-5 rounded-none bg-paper border-2 border-ink shadow-lg space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="border-dashed flex items-center justify-between pb-2 border-b border-ink">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-volt animate-pulse"></div>
                  <h4 className="text-xs font-bold text-ink uppercase tracking-wider truncate max-w-md">
                    {activeVideoModal.title || 'Pemutar Media Interaktif'}
                  </h4>
                </div>
                <button
                  onClick={() => setActiveVideoModal(null)}
                  className="text-xs text-ink/65 hover:text-ink px-3 py-1 rounded-none bg-white border-2 border-ink cursor-pointer"
                >
                  Tutup Pemutar
                </button>
              </div>

              {activeVideoModal.youtubeId ? (
                <div className="relative w-full aspect-video rounded-none overflow-hidden shadow-lg border-2 border-ink bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${activeVideoModal.youtubeId}?autoplay=1&rel=0`}
                    title={activeVideoModal.title || 'YouTube Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              ) : activeVideoModal.url ? (
                <div className="rounded-none overflow-hidden border-2 border-ink bg-black shadow-lg">
                  <video
                    controls
                    autoPlay
                    src={activeVideoModal.url}
                    className="w-full max-h-96 object-contain"
                  />
                </div>
              ) : null}
            </div>
          )}

          {/* Output / Visual Media Result */}
          {result && (
            <div className="border-dashed space-y-4 pt-6 border-t border-ink animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-volt animate-pulse"></span>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-forest font-bold">
                    Hasil Media Siap Digunakan
                  </h4>
                </div>
                <span className="text-[11px] font-mono text-ink/65">
                  Tampilan Visual Interaktif
                </span>
              </div>

              {/* Render Specialized Visual Output Tailored to Each Tool Category */}
              <div className="shadow-lg p-5 sm:p-6 rounded-none bg-paper border-2 border-ink space-y-4">
                {renderSmartFeatureResult(
                  result, 
                  handleCopyResult, 
                  copiedResult, 
                  (videoData) => setActiveVideoModal(videoData),
                  tool
                )}
              </div>
            </div>
          )}
        </div>

        {/* Studio Footer */}
        <div className="border-dashed p-4 sm:p-5 border-t border-ink bg-paper flex items-center justify-between text-xs text-ink/65">
          <span className="flex items-center gap-1.5 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-volt"></span>
            Eksekusi Langsung di Xean Digital
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-none bg-paper hover:bg-sun text-ink text-xs font-mono transition-colors cursor-pointer border-2 border-ink"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// Specialized Smart Formatter: Translates all JSON/Data into human-centric Visual UI (Videos, Images, Audio, Cards, Profiles)
function renderSmartFeatureResult(
  data: any, 
  handleCopy: (text: string) => void,
  copied: boolean,
  onPlayVideo: (videoData: { url?: string; title?: string; youtubeId?: string }) => void,
  toolMeta?: any
): React.ReactNode {
  if (!data) return <span className="text-xs text-ink/65">Tidak ada data yang dihasilkan.</span>;

  // 1. Direct Image Blob Result
  if (data.type === 'image_blob') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative rounded-none overflow-hidden border-2 border-ink shadow-lg max-h-96 max-w-full bg-paper">
          <img src={data.url} alt="Hasil Gambar" className="max-h-96 object-contain" />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={data.url}
            download="xean_digital_result.png"
            className="border-2 border-ink flex items-center gap-2 px-6 py-2.5 rounded-none bg-white hover:bg-volt text-black font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Gambar HD</span>
          </a>

          <a
            href={data.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-none bg-paper hover:bg-sun text-ink/80 hover:text-ink text-xs font-mono transition-colors border-2 border-ink"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Buka Gambar Penuh</span>
          </a>
        </div>
      </div>
    );
  }

  // Unwrap common wrapper keys: { status: true, result: ... } or { data: ... } or { data: { data: ... } }
  let payload = data.result !== undefined ? data.result : (data.data !== undefined ? data.data : data);
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
      payload = { ...payload, ...payload.data };
    }
    if (payload.profile && typeof payload.profile === 'object') {
      payload = { ...payload, ...payload.profile };
    }
  }

  // Check if payload is an object containing a primary media/content list (e.g. KangenJav, Movie list, Search results, Anime list, etc.)
  let extractedList: any[] | null = null;
  let listMeta: { page?: any; total?: any; pagination?: any; category?: string; query?: string } = {};

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const listKey = [
      'movies', 'videos', 'results', 'items', 'list', 'data', 'episodes', 
      'films', 'anime', 'manga', 'dramas', 'news', 'articles', 'posts', 
      'tracks', 'songs', 'images', 'photos', 'channels', 'users'
    ].find(k => Array.isArray(payload[k]) && payload[k].length > 0);

    if (listKey) {
      extractedList = payload[listKey];
      listMeta = {
        page: payload.page || payload.currentPage || payload.pagination?.current || payload.pagination?.page || payload.current_page,
        total: payload.total || payload.totalResults || payload.pagination?.total || payload.pagination?.totalPages || payload.total_pages || payload.count,
        pagination: payload.pagination,
        category: listKey,
        query: payload.query || payload.keyword || payload.q
      };
    }
  }

  // 2. Direct Single Video Stream (e.g. Downloader, direct stream URL, mp4)
  const isDirectVideo = 
    (typeof payload === 'string' && (payload.endsWith('.mp4') || payload.includes('.mp4?') || payload.includes('googlevideo') || payload.includes('/video/'))) ||
    (payload && (payload.video || payload.video_url || payload.play || payload.hdplay || payload.download_url || payload.download) && 
    (typeof (payload.video || payload.video_url || payload.play || payload.hdplay || payload.download_url || payload.download) === 'string'));

  if (isDirectVideo) {
    const videoStreamUrl = typeof payload === 'string' ? payload : (payload.video || payload.video_url || payload.play || payload.hdplay || payload.download_url || payload.download);
    const videoThumb = typeof payload === 'object' ? (payload.thumbnail || payload.cover || payload.thumb || payload.image) : undefined;
    const videoTitle = typeof payload === 'object' ? (payload.title || payload.name || toolMeta?.name || 'Hasil Video') : (toolMeta?.name || 'Hasil Video');
    const author = typeof payload === 'object' ? (payload.author || payload.creator || payload.channel) : undefined;

    return (
      <div className="space-y-4">
        <div className="rounded-none overflow-hidden border-2 border-ink bg-black shadow-lg">
          <video
            controls
            poster={videoThumb}
            src={videoStreamUrl}
            className="w-full max-h-96 object-contain"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
          <div>
            <h4 className="text-sm font-bold text-ink">{videoTitle}</h4>
            {author && <p className="text-xs text-ink/65">{author}</p>}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/api/media-proxy?url=${encodeURIComponent(videoStreamUrl)}&filename=${encodeURIComponent(videoTitle.replace(/[^a-zA-Z0-9]/g, '_') + '.mp4')}`}
              download={`${videoTitle.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`}
              className="border-2 border-ink flex items-center gap-2 px-5 py-2.5 rounded-none bg-white hover:bg-volt text-black font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Video MP4 HD</span>
            </a>

            <button
              onClick={() => handleCopy(videoStreamUrl)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-none bg-paper hover:bg-sun text-ink/80 hover:text-ink text-xs font-mono transition-colors border-2 border-ink cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin Link'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Target array to render (either payload itself or extracted inner list like movies/videos/results)
  const targetList = extractedList || (Array.isArray(payload) ? payload : null);

  // 3. Array of Media / Movie / Video / Content Results (e.g. KangenJav, YouTube Search, TikTok Search, Bilibili, Anime List)
  if (targetList && targetList.length > 0) {
    const firstItem = targetList[0];
    
    // Check if items are Movie / Video / Anime / Drama cards (has thumbnail/cover/image and title/url/code)
    const isMovieOrMediaCard = firstItem && typeof firstItem === 'object' && (
      firstItem.code || 
      firstItem.videoId || 
      firstItem.video_id || 
      firstItem.duration || 
      firstItem.views || 
      firstItem.cast || 
      firstItem.actress || 
      firstItem.maker ||
      firstItem.channel || 
      firstItem.uploader ||
      (firstItem.cover && firstItem.title) ||
      (firstItem.thumb && firstItem.title) ||
      (firstItem.thumbnail && firstItem.title) ||
      (firstItem.image && firstItem.title) ||
      (typeof firstItem.url === 'string' && (firstItem.url.includes('kangen') || firstItem.url.includes('jav') || firstItem.url.includes('youtube') || firstItem.url.includes('tiktok') || firstItem.url.includes('.mp4') || firstItem.url.includes('movie')))
    );

    if (isMovieOrMediaCard) {
      const pageNum = listMeta.page || (typeof payload?.page === 'number' || typeof payload?.page === 'string' ? payload.page : null);
      const totalNum = listMeta.total || (typeof payload?.total === 'number' || typeof payload?.total === 'string' ? payload.total : null);
      const categoryLabel = listMeta.category ? listMeta.category.toUpperCase() : 'MEDIA';

      return (
        <div className="space-y-4">
          {/* Top Pagination & Search Info Header */}
          <div className="border-dashed flex flex-wrap items-center justify-between gap-2 border-b border-ink pb-3">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-forest" />
              <span className="text-xs font-mono font-bold uppercase text-ink tracking-wider">
                Daftar {categoryLabel} ({targetList.length} Item Ditampilkan)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {pageNum && (
                <span className="px-2.5 py-0.5 rounded-none bg-paper border-2 border-ink text-[11px] font-mono text-forest">
                  Halaman {pageNum} {totalNum ? `dari ${totalNum}` : ''}
                </span>
              )}
              {listMeta.pagination?.hasNext && (
                <span className="px-2 py-0.5 rounded-none bg-volt/50 text-ink text-[11px] font-mono border-2 border-ink">
                  Ada Halaman Berikutnya
                </span>
              )}
            </div>
          </div>

          {/* Responsive Media Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[540px] overflow-y-auto pr-1">
            {targetList.map((item: any, idx: number) => {
              if (!item || typeof item !== 'object') {
                return (
                  <div key={idx} className="shadow-lg p-3 rounded-none bg-paper border-2 border-ink text-xs text-ink">
                    {String(item)}
                  </div>
                );
              }

              const itemTitle = item.title || item.name || item.text || item.code || `Media #${idx + 1}`;
              const itemUrl = item.url || item.link || item.videoUrl || item.download || item.href;
              const ytId = extractYouTubeId(itemUrl || item.videoId || item.video_id || item.id || '');
              const itemThumb = item.thumbnail || item.thumb || item.cover || item.image || item.poster || item.img || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : '');
              const itemCode = item.code || item.id || item.video_code;
              const itemAuthor = item.cast || item.actress || item.maker || item.channel || item.author || item.uploader || item.creator || '';
              const duration = item.duration || item.timestamp || item.duration_formatted || item.time || '';
              const views = item.views || item.viewCount || item.views_formatted || item.uploaded || item.date || item.release_date || '';

              return (
                <div 
                  key={idx} 
                  className="group rounded-none bg-paper border-2 border-ink overflow-hidden flex flex-col justify-between shadow-md transition-all"
                >
                  {/* Thumbnail / Poster Banner */}
                  <div className="relative aspect-[16/10] sm:aspect-video bg-white overflow-hidden">
                    {itemThumb ? (
                      <img 
                        src={itemThumb} 
                        alt={itemTitle} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes('/api/media-proxy') && itemThumb.startsWith('http')) {
                            target.src = `/api/media-proxy?url=${encodeURIComponent(itemThumb)}&inline=true`;
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink/55">
                        <Film className="w-10 h-10" />
                      </div>
                    )}

                    {/* Code Badge (e.g. IPX-123, SSIS-456) */}
                    {itemCode && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-none bg-ink/75 text-[11px] font-mono text-volt font-bold border-2 border-ink ">
                        {itemCode}
                      </span>
                    )}

                    {/* Duration / Date badge */}
                    {(duration || views) && (
                      <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-none bg-ink/75 text-[11px] font-mono text-white font-bold max-w-[80%] truncate">
                        {duration || views}
                      </span>
                    )}

                    {/* Quick Play Trigger Overlay if Playable */}
                    {(ytId || (itemUrl && (itemUrl.includes('.mp4') || itemUrl.includes('youtube')))) && (
                      <button
                        onClick={() => onPlayVideo({ url: itemUrl, title: itemTitle, youtubeId: ytId || undefined })}
                        className="border-2 border-ink absolute inset-0 m-auto w-11 h-11 rounded-full bg-white/90 hover:bg-volt text-black flex items-center justify-center shadow-md opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    )}
                  </div>

                  {/* Video Meta & Action */}
                  <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1">
                      <h5 className="text-xs font-bold text-ink line-clamp-2 leading-snug group-hover:text-forest transition-colors">
                        {itemTitle}
                      </h5>
                      {itemAuthor && (
                        <p className="text-[11px] text-ink/65 font-medium truncate">
                          {itemAuthor}
                        </p>
                      )}
                    </div>

                    <div className="border-dashed flex items-center gap-2 pt-1 border-t border-ink">
                      {ytId || (itemUrl && itemUrl.includes('.mp4')) ? (
                        <button
                          onClick={() => onPlayVideo({ url: itemUrl, title: itemTitle, youtubeId: ytId || undefined })}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-none bg-paper hover:bg-sun text-ink hover:text-forest text-[11px] font-mono transition-colors border-2 border-ink cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Tonton</span>
                        </button>
                      ) : itemUrl ? (
                        <a
                          href={itemUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="border-2 border-ink flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-none bg-white hover:bg-volt text-black font-bold text-[11px] font-mono uppercase tracking-wider transition-colors shadow-md"
                        >
                          <span>Buka Detail</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : null}

                      {itemUrl && (
                        <button
                          onClick={() => handleCopy(itemUrl)}
                          className="p-2 rounded-none bg-paper hover:bg-white text-ink/80 hover:text-black transition-colors border-2 border-ink cursor-pointer"
                          title="Salin URL"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Check if Array of Images (Pinterest search, Wallpaper, Stickers, Gallery)
    const isImageItem = firstItem && (
      (typeof firstItem === 'string' && (firstItem.startsWith('http') && (firstItem.includes('.jpg') || firstItem.includes('.png') || firstItem.includes('.webp') || firstItem.includes('pinterest') || firstItem.includes('pinimg')))) ||
      (typeof firstItem === 'object' && (firstItem.image || firstItem.imageUrl || firstItem.img || firstItem.thumbnail || firstItem.thumb || firstItem.media))
    );

    if (isImageItem) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-ink/80 flex items-center gap-2">
              <Palette className="w-4 h-4 text-forest" />
              <span>Galeri Gambar ({targetList.length} Gambar HD)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
            {targetList.map((item: any, idx: number) => {
              const imgUrl = typeof item === 'string' ? item : (item.image || item.imageUrl || item.img || item.url || item.thumbnail || item.thumb || item.media);
              const imgTitle = typeof item === 'object' ? (item.title || item.name || `Gambar #${idx + 1}`) : `Gambar #${idx + 1}`;

              return (
                <div key={idx} className="group relative rounded-none bg-paper border-2 border-ink overflow-hidden shadow-md">
                  <img
                    src={imgUrl}
                    alt={imgTitle}
                    referrerPolicy="no-referrer"
                    className="w-full h-44 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes('/api/media-proxy') && typeof imgUrl === 'string' && imgUrl.startsWith('http')) {
                        target.src = `/api/media-proxy?url=${encodeURIComponent(imgUrl)}&inline=true`;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 space-y-2">
                    <p className="text-[11px] text-ink font-medium truncate">{imgTitle}</p>
                    <div className="flex items-center gap-2">
                      <a
                        href={imgUrl}
                        download={`xean_image_${idx + 1}.png`}
                        className="border-2 border-ink shadow-sm flex-1 py-1.5 px-3 rounded-none bg-white hover:bg-volt text-black font-bold text-[11px] uppercase tracking-wider text-center transition-colors"
                      >
                        Unduh HD
                      </a>
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="border-2 border-ink shadow-sm p-1.5 rounded-none bg-white text-ink hover:bg-sun"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // Check if Array of Audio/Music tracks (Spotify Search, Joox, MP3)
    const isAudioListItem = firstItem && typeof firstItem === 'object' && (firstItem.audio || firstItem.mp3 || firstItem.track || firstItem.preview_url || firstItem.artist || firstItem.album);
    if (isAudioListItem) {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-ink/80 flex items-center gap-2">
              <Music className="w-4 h-4 text-forest" />
              <span>Daftar Lagu & Musik ({targetList.length} Track)</span>
            </span>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {targetList.map((item: any, idx: number) => {
              const trackTitle = item.title || item.name || item.track || `Track #${idx + 1}`;
              const trackArtist = item.artist || item.author || item.singers || '';
              const trackCover = item.thumbnail || item.cover || item.image || item.album?.image;
              const trackAudio = item.audio || item.mp3 || item.preview_url || item.download_url || item.url;
              const trackDuration = item.duration || item.duration_formatted || '';

              return (
                <div key={idx} className="p-3.5 rounded-none bg-paper border-2 border-ink flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                  <div className="flex items-center gap-3.5 min-w-0">
                    {trackCover ? (
                      <img src={trackCover} alt={trackTitle} className="w-12 h-12 rounded-none object-cover shrink-0 border-2 border-ink" />
                    ) : (
                      <div className="w-12 h-12 rounded-none bg-paper flex items-center justify-center text-ink/65 shrink-0 border-2 border-ink">
                        <Music className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-ink truncate">{trackTitle}</h5>
                      <p className="text-[11px] text-ink/65 truncate">{trackArtist || 'Audio Track'} {trackDuration && `• ${trackDuration}`}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    {trackAudio && (
                      <audio controls src={trackAudio} className="h-8 max-w-[200px]" />
                    )}
                    {trackAudio && (
                      <a
                        href={trackAudio}
                        download={`${trackTitle}.mp3`}
                        className="border-2 border-ink shadow-sm py-1.5 px-3 rounded-none bg-white hover:bg-volt text-black font-bold text-[11px] uppercase tracking-wider transition-colors shrink-0"
                      >
                        Unduh MP3
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  }

  // 4. Direct Single Image URL in payload (Logo makers, TextPro, AI Art, Ephoto360)
  const imageUrl = typeof payload === 'string' && (payload.startsWith('http://') || payload.startsWith('https://')) && (payload.match(/\.(jpeg|jpg|png|webp|gif)/i) || payload.includes('image') || payload.includes('img') || payload.includes('cdn')) 
    ? payload 
    : (payload?.url || payload?.image || payload?.imageUrl || payload?.img || payload?.result_url);

  if (imageUrl && typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative rounded-none overflow-hidden border-2 border-ink shadow-lg max-h-96 max-w-full bg-paper">
          <img 
            src={imageUrl} 
            alt="Hasil Visual" 
            className="max-h-96 object-contain"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="border-2 border-ink flex items-center gap-2 px-6 py-2.5 rounded-none bg-white hover:bg-volt text-black font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Unduh / Buka Gambar HD</span>
          </a>

          <button
            onClick={() => handleCopy(imageUrl)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-none bg-paper hover:bg-sun text-ink/80 hover:text-ink text-xs font-mono transition-colors border-2 border-ink cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin Link'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 5. Social Stalker / Profile Result (Instagram, TikTok, Twitter/X, GitHub)
  const isProfile = payload && (payload.username || payload.followers || payload.following || payload.bio || payload.nickname || payload.avatar || payload.profile);
  if (isProfile && typeof payload === 'object') {
    const avatar = payload.avatar || payload.photo || payload.profile_pic || payload.profile || payload.pp;
    const username = payload.username || payload.user || payload.id;
    const name = payload.name || payload.nickname || payload.fullname || username;
    const bio = payload.bio || payload.biography || payload.description || payload.about;
    const followers = payload.followers || payload.follower_count || payload.total_followers;
    const following = payload.following || payload.following_count || payload.total_following;
    const posts = payload.posts || payload.total_posts || payload.media_count || payload.video_count;

    return (
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {avatar ? (
            <img 
              src={avatar} 
              alt={name} 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-ink shadow-md" 
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-paper border-2 border-ink flex items-center justify-center text-ink">
              <User className="w-8 h-8 text-ink/65" />
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-lg font-bold text-ink">{name}</h3>
              {username && (
                <span className="text-xs font-mono text-ink/65 bg-paper px-2.5 py-0.5 rounded-none border-2 border-ink">
                  @{username}
                </span>
              )}
            </div>

            {bio && (
              <p className="text-xs text-ink/80 font-medium leading-relaxed max-w-lg">
                {bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-2 text-center">
          {followers !== undefined && (
            <div className="shadow-lg p-3 rounded-none bg-paper border-2 border-ink">
              <span className="text-[11px] font-mono text-ink/65 uppercase block">Pengikut</span>
              <strong className="text-sm sm:text-base text-ink font-mono">{String(followers)}</strong>
            </div>
          )}

          {following !== undefined && (
            <div className="shadow-lg p-3 rounded-none bg-paper border-2 border-ink">
              <span className="text-[11px] font-mono text-ink/65 uppercase block">Mengikuti</span>
              <strong className="text-sm sm:text-base text-ink font-mono">{String(following)}</strong>
            </div>
          )}

          {posts !== undefined && (
            <div className="shadow-lg p-3 rounded-none bg-paper border-2 border-ink">
              <span className="text-[11px] font-mono text-ink/65 uppercase block">Postingan / Video</span>
              <strong className="text-sm sm:text-base text-ink font-mono">{String(posts)}</strong>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 6. Media / Audio Stream Result (Downloader, Spotify, Soundcloud)
  const isAudioOrMedia = payload && (payload.audio || payload.mp3 || payload.downloadUrl || payload.music || payload.track);
  if (isAudioOrMedia && typeof payload === 'object') {
    const title = payload.title || payload.name || payload.track?.title || 'Audio & Media';
    const author = payload.author || payload.artist || payload.creator || payload.track?.artist || '';
    const audioUrl = payload.audio || payload.mp3 || payload.download_url || payload.download || payload.track?.mp3;
    const thumb = payload.thumbnail || payload.cover || payload.thumb || payload.image;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          {thumb && (
            <img src={thumb} alt={title} className="w-16 h-16 rounded-none object-cover shadow-lg border-2 border-ink" />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-ink truncate">{title}</h4>
            {author && <p className="text-xs text-ink/65 truncate">{author}</p>}
          </div>
        </div>

        {audioUrl && typeof audioUrl === 'string' && (
          <div className="space-y-3 pt-2">
            <audio controls src={audioUrl} className="w-full h-10 rounded-none" />
            <div className="flex justify-center pt-2">
              <a
                href={audioUrl}
                target="_blank"
                rel="noreferrer"
                download="xean_audio.mp3"
                className="border-2 border-ink flex items-center gap-2 px-6 py-2.5 rounded-none bg-white hover:bg-volt text-black font-bold text-xs uppercase tracking-wider shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Unduh File Lagu MP3</span>
              </a>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 7. Quran / Islamic / Scripture Result
  if (payload && (payload.surah || payload.ayat || payload.arab || payload.latin || payload.terjemahan || payload.jadwal)) {
    return (
      <div className="space-y-4 font-sans">
        {payload.surah && (
          <div className="border-dashed flex items-center justify-between border-b border-ink pb-3">
            <h3 className="font-serif text-ink text-lg">Surah {payload.surah}</h3>
            {payload.nomor && <span className="text-xs font-mono text-ink/65">Ayat {payload.nomor}</span>}
          </div>
        )}

        {payload.arab && (
          <div className="shadow-lg p-5 rounded-none bg-paper border-2 border-ink text-right font-serif text-2xl text-ink leading-loose tracking-wide">
            {payload.arab}
          </div>
        )}

        {payload.latin && (
          <p className="text-xs text-ink/80 italic font-medium">
            {payload.latin}
          </p>
        )}

        {payload.terjemahan && (
          <div className="shadow-lg p-4 rounded-none bg-paper border-2 border-ink text-xs text-ink leading-relaxed">
            <strong className="block text-forest font-mono text-[11px] uppercase mb-1">Artinya:</strong>
            {payload.terjemahan}
          </div>
        )}

        {payload.jadwal && typeof payload.jadwal === 'object' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            {Object.entries(payload.jadwal).map(([waktu, jam]: [string, any], idx) => (
              <div key={idx} className="shadow-lg p-3 rounded-none bg-paper border-2 border-ink text-center">
                <span className="text-[11px] font-mono uppercase text-ink/65 block">{waktu}</span>
                <strong className="text-sm text-ink font-mono">{String(jam)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 8. Anime / Manga / Film / Drama result
  if (payload && (payload.synopsis || payload.score || payload.episodes || payload.genres || payload.genre || payload.rating)) {
    const poster = payload.poster || payload.thumbnail || payload.image || payload.cover;
    const title = payload.title || payload.name || 'Detail Film / Anime';
    const score = payload.score || payload.rating;
    const synopsis = payload.synopsis || payload.description || payload.overview || '';
    const genres = Array.isArray(payload.genres) ? payload.genres : (typeof payload.genre === 'string' ? payload.genre.split(',') : []);

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          {poster && (
            <img src={poster} alt={title} className="w-28 sm:w-36 rounded-none object-cover shadow-md border-2 border-ink shrink-0" />
          )}
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-base font-bold text-ink">{title}</h4>
              {score && (
                <span className="px-2.5 py-0.5 rounded-none bg-paper text-amber text-xs font-mono font-bold border-2 border-ink flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  {score}
                </span>
              )}
            </div>

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {genres.map((g: any, gIdx: number) => (
                  <span key={gIdx} className="px-2 py-0.5 rounded-none bg-white text-ink/80 text-[11px] font-mono border-2 border-ink">
                    {typeof g === 'object' ? (g.name || g.label) : String(g).trim()}
                  </span>
                ))}
              </div>
            )}

            {synopsis && (
              <p className="text-xs text-ink/80 font-medium leading-relaxed pt-1 max-h-48 overflow-y-auto">
                {synopsis}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 9. Text / AI / Model / Lyrics Result
  const textContent = typeof payload === 'string' 
    ? payload 
    : (payload?.reply || payload?.response || payload?.text || payload?.result || payload?.content || payload?.lyrics || data?.reply || data?.content || data?.result);

  const modelBadge = payload?.model || data?.model || null;
  const thinkingTrace: string[] = Array.isArray(payload?.thinking) ? payload.thinking : (Array.isArray(data?.thinking) ? data.thinking : []);

  if (textContent && typeof textContent === 'string') {
    return (
      <div className="space-y-4">
        {modelBadge && (
          <div className="border-dashed flex items-center justify-between border-b border-ink pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-volt animate-pulse"></div>
              <span className="text-xs font-mono text-ink font-bold uppercase">{String(modelBadge)}</span>
            </div>
            <span className="text-[11px] font-mono text-ink/65">Verified Synthesis</span>
          </div>
        )}

        {thinkingTrace.length > 0 && (
          <div className="shadow-lg p-3.5 rounded-none bg-paper border-2 border-ink text-[11px] text-ink/65 font-mono space-y-1.5">
            <div className="flex items-center gap-1.5 text-forest font-semibold text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Thinking Trace ({thinkingTrace.length} Langkah)</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-ink/80">
              {thinkingTrace.map((step, sIdx) => (
                <li key={sIdx}>{step}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="shadow-lg p-5 rounded-none bg-paper border-2 border-ink text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-wrap font-sans font-medium max-h-96 overflow-y-auto">
          {textContent}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => handleCopy(textContent)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-none bg-paper hover:bg-sun text-ink/80 hover:text-ink text-xs font-mono transition-colors border-2 border-ink cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-forest" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Teks Tersalin' : 'Salin Teks Lengkap'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 10. General Structured Array List Formatter (Clean Card List with Action Buttons, NO RAW JSON)
  if (Array.isArray(payload)) {
    return (
      <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
        <h4 className="text-[11px] font-mono text-ink/65">
          Daftar Hasil ({payload.length} item):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {payload.slice(0, 30).map((item: any, idx: number) => {
            const title = typeof item === 'object' ? (item.title || item.name || item.text || item.label || item.headline || `Item #${idx + 1}`) : String(item);
            const link = typeof item === 'object' ? (item.url || item.link || item.download || item.href) : null;
            const subtitle = typeof item === 'object' ? (item.description || item.author || item.category || item.date || item.snippet || '') : '';

            return (
              <div key={idx} className="p-4 rounded-none bg-paper border-2 border-ink transition-all flex flex-col justify-between gap-3 shadow-sm">
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-ink line-clamp-2">{title}</h5>
                  {subtitle && <p className="text-[11px] text-ink/65 line-clamp-2">{subtitle}</p>}
                </div>
                {link && (
                  <div className="flex justify-end pt-1">
                    <a
                      href={link}
                      target="_blank"
                      rel="noreferrer"
                      className="border-2 border-ink shadow-sm inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-3.5 py-1.5 rounded-none bg-white text-black font-bold hover:bg-volt transition-colors"
                    >
                      <span>Buka Media</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 11. General Object Formatter (Clean Human-Readable Stat Cards, NO [object Object] and NO RAW JSON)
  if (typeof payload === 'object' && payload !== null) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(payload).map(([k, v], idx) => {
            if (v === null || v === undefined || k === 'status' || k === 'success') return null;
            const label = k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').toUpperCase();

            return (
              <div key={idx} className="shadow-lg p-4 rounded-none bg-paper border-2 border-ink space-y-2">
                <span className="text-[11px] font-mono text-ink/65 block font-semibold">
                  {label}
                </span>

                <div className="text-xs text-ink">
                  {renderNestedValue(v, handleCopy, copied)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return <div className="text-xs text-ink font-sans p-4 rounded-none bg-paper">{String(payload)}</div>;
}

// Helper to recursively render any value nicely without [object Object]
function renderNestedValue(val: any, handleCopy?: (text: string) => void, copied?: boolean): React.ReactNode {
  if (val === null || val === undefined) {
    return <span className="text-ink/65 italic">-</span>;
  }

  if (typeof val === 'boolean') {
    return (
      <span className={`px-2 py-0.5 rounded-none text-[11px] font-mono font-bold ${val ? 'bg-volt/50 text-ink border-2 border-ink' : 'bg-alert/50 text-ink border-2 border-ink'}`}>
        {val ? 'Aktif / True' : 'Nonaktif / False'}
      </span>
    );
  }

  if (typeof val === 'number') {
    return <span className="font-mono text-ink font-semibold">{val.toLocaleString('id-ID')}</span>;
  }

  if (typeof val === 'string') {
    const isHttp = val.startsWith('http://') || val.startsWith('https://');
    const isImage = isHttp && (val.match(/\.(jpeg|jpg|png|webp|gif)/i) || val.includes('image') || val.includes('img') || val.includes('cover') || val.includes('thumb'));

    if (isImage) {
      return (
        <div className="space-y-2">
          <img 
            src={val} 
            alt="Preview" 
            referrerPolicy="no-referrer"
            className="w-full max-h-48 object-cover rounded-none border-2 border-ink" 
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('/api/media-proxy') && val.startsWith('http')) {
                target.src = `/api/media-proxy?url=${encodeURIComponent(val)}&inline=true`;
              }
            }}
          />
          <a
            href={val}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-mono text-forest hover:underline"
          >
            <span>Buka Gambar Penuh</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      );
    }

    if (isHttp) {
      return (
        <a
          href={val}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-forest hover:underline font-mono break-all"
        >
          <span className="truncate max-w-xs">{val}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      );
    }

    return <span className="text-ink whitespace-pre-wrap">{val}</span>;
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return <span className="text-ink/65 italic">Daftar kosong</span>;

    // Array of primitives (strings, numbers)
    const isPrimitiveArray = val.every(item => typeof item !== 'object' || item === null);
    if (isPrimitiveArray) {
      return (
        <div className="flex flex-wrap gap-1.5">
          {val.map((item, i) => (
            <span key={i} className="px-2.5 py-1 rounded-none bg-paper text-ink text-[11px] font-mono border-2 border-ink">
              {String(item)}
            </span>
          ))}
        </div>
      );
    }

    // Array of objects -> render each object as a card
    return (
      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
        {val.map((item, i) => (
          <div key={i} className="p-3 rounded-none bg-white border-2 border-ink space-y-1.5 shadow-sm">
            {typeof item === 'object' && item !== null ? (
              <div className="space-y-1 text-[11px]">
                {Object.entries(item).map(([subK, subV], subIdx) => (
                  <div key={subIdx} className="border-dashed flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-ink pb-1 last:border-0 last:pb-0">
                    <span className="text-ink/65 font-mono shrink-0">{subK.replace(/_/g, ' ')}:</span>
                    <div className="text-ink sm:text-right overflow-hidden">
                      {renderNestedValue(subV, handleCopy, copied)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-ink">{String(item)}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Nested Object
  if (typeof val === 'object') {
    return (
      <div className="p-3 rounded-none bg-white border-2 border-ink space-y-1.5 text-xs text-ink/80">
        {Object.entries(val).map(([subK, subV], subIdx) => (
          <div key={subIdx} className="border-dashed flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-ink pb-1 last:border-0 last:pb-0 text-[11px]">
            <span className="text-ink/65 font-mono shrink-0">{subK.replace(/_/g, ' ')}:</span>
            <div className="text-ink sm:text-right overflow-hidden">
              {renderNestedValue(subV, handleCopy, copied)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-ink">{String(val)}</span>;
}