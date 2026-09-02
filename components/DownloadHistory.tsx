'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { HistoryItem } from '../types';
import { 
  History, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  Clock, 
  FileVideo, 
  Music
} from 'lucide-react';
import { downloadMediaFile } from '../utils/downloadHelper';

interface DownloadHistoryProps {
  items: HistoryItem[];
  onClearHistory: () => void;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({
  items,
  onClearHistory
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Tautan Berhasil Disalin', {
      description: 'URL unduhan telah disalin ke clipboard.'
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (item: HistoryItem) => {
    downloadMediaFile({
      url: item.downloadUrl,
      title: item.title || item.platform,
      platform: item.platform,
      format: item.type === 'audio' ? 'MP3' : 'MP4',
      isAudio: item.type === 'audio'
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-6 border-b border-[#ffffff08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#4F46E5]" />
            <h2 className="text-2xl sm:text-3xl font-serif italic text-white font-normal">
              Media Stream Archive
            </h2>
          </div>
          <p className="text-xs text-[#888] font-light mt-1">
            Persisted logs of extracted media files and download links from your active session.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141414] hover:bg-[#FF3344]/20 text-[#888] hover:text-[#FF8888] border border-[#ffffff08] text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Archive</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-[#0D0D0D] border border-[#ffffff08] rounded-3xl p-14 text-center space-y-3">
          <History className="w-10 h-10 text-[#444] mx-auto" />
          <h3 className="text-base font-serif italic text-white">No extraction logs found</h3>
          <p className="text-xs text-[#777] max-w-sm mx-auto font-light leading-relaxed">
            Streams and media extracted through TikTok, Instagram, YouTube, Spotify or other endpoints will automatically appear in this archive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item) => {
            const isCopied = copiedId === item.id;
            const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <div
                key={item.id}
                className="bg-[#0D0D0D] border border-[#ffffff08] hover:border-[#ffffff18] rounded-2xl p-4.5 flex gap-4 items-start group transition-all"
              >
                <div className="w-16 h-16 rounded-xl bg-[#050505] border border-[#ffffff08] overflow-hidden shrink-0 flex items-center justify-center">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : item.type === 'audio' ? (
                    <Music className="w-6 h-6 text-[#00FF88]" />
                  ) : (
                    <FileVideo className="w-6 h-6 text-[#4F46E5]" />
                  )}
                </div>

                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-[#050505] text-[#AAA] border border-[#ffffff08]">
                      {item.platform}
                    </span>
                    <span className="text-[10px] text-[#666] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {timeStr}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate group-hover:text-[#CCC] transition-colors">
                    {item.title}
                  </h4>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleDownload(item)}
                      className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-white hover:text-[#00FF88] transition-colors cursor-pointer"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>

                    <button
                      onClick={() => handleCopy(item.downloadUrl, item.id)}
                      className="text-[11px] text-[#777] hover:text-white flex items-center gap-1 ml-auto font-mono cursor-pointer"
                    >
                      {isCopied ? <Check className="w-3 h-3 text-[#00FF88]" /> : <Copy className="w-3 h-3" />}
                      <span>{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};