'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { 
  Music, 
  Search, 
  Download, 
  Play, 
  FileText, 
  Disc, 
  Check, 
  Copy, 
  ExternalLink, 
  RefreshCw,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { downloadMediaFile } from '../utils/downloadHelper';

export const SpotifyHub: React.FC = () => {
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'download' | 'lyrics' | 'search'>('download');
  const [isLoading, setIsLoading] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [lyricsData, setLyricsData] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<'idle' | 'downloading' | 'completed'>('idle');

  const handleDownloadFile = async (audioUrl: string, trackTitle: string) => {
    if (!audioUrl) return;
    setDownloadProgress('downloading');

    try {
      await downloadMediaFile({
        url: audioUrl,
        title: trackTitle || 'Spotify Track',
        platform: 'Spotify',
        format: 'MP3',
        isAudio: true
      });
      setDownloadProgress('completed');
      setTimeout(() => setDownloadProgress('idle'), 3000);
    } catch {
      setDownloadProgress('idle');
    }
  };

  const handleDownloadTrack = async (customUrl?: string) => {
    const url = (customUrl || spotifyUrl).trim();
    if (!url) {
      setErrorMessage('Masukkan link lagu Spotify terlebih dahulu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResultData(null);

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          platform: 'spotify'
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses lagu Spotify.');
      }

      setResultData(data.result);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#10b981', '#06b6d4', '#3b82f6']
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses link Spotify.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchLyrics = async () => {
    if (!spotifyUrl.trim()) {
      setErrorMessage('Masukkan link lagu Spotify untuk mencari lirik.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLyricsData(null);

    try {
      const response = await fetch(`/api/xean-service?path=/api/v1/spotify/lyrics&url=${encodeURIComponent(spotifyUrl.trim())}`);
      const data = await response.json();

      if (!response.ok || !data) {
        throw new Error('Lirik tidak ditemukan untuk lagu ini.');
      }

      setLyricsData(data.result || data.lyrics || data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengambil lirik lagu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSpotify = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSearchResults([]);

    try {
      const response = await fetch(`/api/xean-service?path=/api/v1/spotify/search&query=${encodeURIComponent(searchQuery.trim())}`);
      const data = await response.json();

      const items = data.result || data.tracks || data.items || (Array.isArray(data) ? data : []);
      setSearchResults(Array.isArray(items) ? items : []);
    } catch (err: any) {
      setErrorMessage('Gagal mencari di Spotify.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Presentation Header */}
      <div className="text-center space-y-3 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.3em] bg-[#111111] text-[#AAA] border border-[#ffffff12]">
          <Music className="w-3.5 h-3.5 text-[#00FF88]" />
          <span>High-Fidelity 320kbps Audio Pipeline</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif italic text-white font-normal tracking-tight">
          Spotify Music Suite
        </h2>
        <p className="text-xs sm:text-sm text-[#888] font-light max-w-xl mx-auto leading-relaxed">
          Direct extraction of high-bitrate studio audio streams, synced lyric metadata, and global Spotify catalog indexing.
        </p>
      </div>

      {/* Mode Selector Tabs */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('download')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
            activeTab === 'download'
              ? 'bg-white text-black shadow-md'
              : 'bg-[#0D0D0D] text-[#888] hover:text-white border border-[#ffffff08]'
          }`}
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Audio (320k)</span>
        </button>

        <button
          onClick={() => setActiveTab('lyrics')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
            activeTab === 'lyrics'
              ? 'bg-white text-black shadow-md'
              : 'bg-[#0D0D0D] text-[#888] hover:text-white border border-[#ffffff08]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Synced Lyrics</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs uppercase tracking-wider font-semibold transition-all ${
            activeTab === 'search'
              ? 'bg-white text-black shadow-md'
              : 'bg-[#0D0D0D] text-[#888] hover:text-white border border-[#ffffff08]'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Catalog Search</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-[#0D0D0D] border border-[#ffffff10] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Search / URL Inputs */}
        {activeTab === 'search' ? (
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#888]">Search Spotify Tracks:</label>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearchSpotify();
              }}
              className="flex items-center gap-2 bg-[#050505] border border-[#ffffff12] focus-within:border-[#4F46E5] rounded-full p-2 pl-4"
            >
              <Search className="w-4 h-4 text-[#666] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter song title or artist name..."
                className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-white placeholder-[#555] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading || !searchQuery.trim()}
                className="px-6 py-2.5 rounded-full bg-white hover:bg-[#00FF88] text-black font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                {isLoading ? 'Searching...' : 'Search'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-[#888]">
              Spotify Track URL:
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-[#050505] border border-[#ffffff12] focus-within:border-[#4F46E5] rounded-full p-2 pl-4">
              <input
                type="text"
                value={spotifyUrl}
                onChange={(e) => {
                  setSpotifyUrl(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="https://open.spotify.com/track/..."
                className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-white placeholder-[#555] focus:outline-none"
              />
              <button
                onClick={() => (activeTab === 'lyrics' ? handleFetchLyrics() : handleDownloadTrack())}
                disabled={isLoading || !spotifyUrl.trim()}
                className="flex items-center justify-center gap-2 px-7 py-2.5 rounded-full bg-white hover:bg-[#00FF88] disabled:opacity-40 text-black font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : activeTab === 'lyrics' ? (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Fetch Lyrics</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP3</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-[#1A0A0A] border border-[#FF3344]/30 text-[#FF9999] text-xs flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-[#FF4444] shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Download Result View */}
        {resultData && activeTab === 'download' && (
          <div className="p-6 rounded-3xl bg-[#080808] border border-[#ffffff12] flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
            {resultData.thumbnail && (
              <img
                src={resultData.thumbnail}
                alt="Cover"
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover shadow-2xl border border-[#ffffff10]"
              />
            )}

            <div className="flex-1 space-y-3 text-center sm:text-left w-full">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-[#141414] text-[#00FF88] border border-[#ffffff08]">
                  Spotify Master Stream
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono text-[#888] bg-[#141414] border border-[#ffffff08]">
                  320kbps MP3 HQ
                </span>
              </div>
              
              <div>
                <h4 className="text-base sm:text-lg font-serif italic text-white leading-snug">{resultData.title}</h4>
                <p className="text-xs text-[#888] font-light">{resultData.author}</p>
              </div>

              {/* In-Browser Audio Player */}
              {resultData.audioUrl && (
                <div className="pt-1 w-full max-w-md">
                  <audio
                    controls
                    className="w-full h-8 accent-[#00FF88]"
                    src={resultData.audioUrl}
                    preload="metadata"
                  >
                    Browser Anda tidak mendukung pemutar audio.
                  </audio>
                </div>
              )}

              {resultData.audioUrl && (
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <button
                    onClick={() => handleDownloadFile(resultData.audioUrl, resultData.title)}
                    disabled={downloadProgress === 'downloading'}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-[#00FF88] text-black font-bold text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {downloadProgress === 'downloading' ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Mengunduh ke Perangkat...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download 320kbps MP3</span>
                      </>
                    )}
                  </button>

                  <a
                    href={resultData.audioUrl}
                    target="_blank"
                    rel="noreferrer"
                    title="Buka langsung jika notifikasi unduhan tidak muncul"
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#141414] hover:bg-[#202020] text-[#AAA] hover:text-white text-xs font-mono uppercase tracking-wider transition-colors border border-[#ffffff08]"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#00FF88]" />
                    <span>Direct Tab</span>
                  </a>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resultData.audioUrl);
                      toast.success('Tautan Berhasil Disalin', {
                        description: 'URL audio langsung Spotify telah disalin ke clipboard.'
                      });
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#141414] hover:bg-[#202020] text-[#AAA] hover:text-white text-xs font-mono uppercase tracking-wider transition-colors border border-[#ffffff08] cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 text-[#888]" />
                    <span>Salin Link</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lyrics Result View */}
        {lyricsData && activeTab === 'lyrics' && (
          <div className="p-6 rounded-3xl bg-[#080808] border border-[#ffffff08] space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#00FF88] flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>Full Song Lyrics:</span>
            </h4>
            <div className="text-xs text-[#CCC] leading-relaxed whitespace-pre-wrap font-sans font-light max-h-80 overflow-y-auto p-4 bg-[#050505] rounded-2xl border border-[#ffffff08]">
              {typeof lyricsData === 'string' ? lyricsData : lyricsData.lyrics || JSON.stringify(lyricsData, null, 2)}
            </div>
          </div>
        )}

        {/* Search Results Grid */}
        {searchResults.length > 0 && activeTab === 'search' && (
          <div className="space-y-3">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#666]">Search Index Results:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {searchResults.map((item: any, idx: number) => {
                const trackTitle = item.title || item.name;
                const artistName = item.artist || item.artists?.[0]?.name || 'Spotify Artist';
                const trackUrl = item.url || item.external_urls?.spotify;

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#080808] border border-[#ffffff08] hover:border-[#ffffff18] flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="space-y-1 truncate">
                      <div className="text-xs font-bold text-white group-hover:text-[#CCC] truncate">
                        {trackTitle}
                      </div>
                      <div className="text-[11px] text-[#777] font-light truncate">{artistName}</div>
                    </div>

                    {trackUrl && (
                      <button
                        onClick={() => {
                          setSpotifyUrl(trackUrl);
                          setActiveTab('download');
                          handleDownloadTrack(trackUrl);
                        }}
                        className="px-4 py-1.5 rounded-full bg-white hover:bg-[#00FF88] text-black font-bold text-[10px] font-mono uppercase tracking-wider shrink-0 transition-colors"
                      >
                        Extract
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};