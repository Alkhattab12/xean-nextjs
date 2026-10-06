'use client';

import React, { useState, useMemo } from 'react';
import { ApiEndpoint } from '../types';
import { FEATURED_TOOLS, FeaturedTool } from '../data/featuredTools';
import rawEndpoints from '../data/endpoints.json';
import { InteractiveToolModal } from './InteractiveToolModal';
import { useAuth } from '../utils/userContext';
import { 
  Search, 
  Sparkles, 
  Zap, 
  Play, 
  Layers, 
  Music, 
  Download, 
  SlidersHorizontal,
  ChevronRight,
  Filter,
  Code2,
  Image as ImageIcon,
  UserCheck,
  Globe,
  FileText,
  Gamepad2,
  BookOpen,
  Film,
  Compass,
  Palette,
  Bot
} from 'lucide-react';

const allEndpoints = rawEndpoints as ApiEndpoint[];

const CATEGORY_MAP: { id: string; label: string; icon: any; count?: number }[] = [
  { id: 'all', label: 'Semua Fitur (334+)', icon: Layers },
  { id: 'featured', label: '🌟 Pilihan Populer', icon: Sparkles },
  { id: 'textpro-maker', label: '🎨 Generator Logo & 3D Text', icon: Palette },
  { id: 'ai-suite', label: '🤖 AI Studio & Art', icon: Bot },
  { id: 'downloader', label: '📥 Media Downloader', icon: Download },
  { id: 'stalker', label: '🔍 Cek Akun & Stalker', icon: UserCheck },
  { id: 'tools-web', label: '🛠️ Utilitas Web & Praktis', icon: SlidersHorizontal },
  { id: 'spotify-audio', label: '🎵 Musik & Spotify', icon: Music },
  { id: 'agama', label: '📖 Islami & Edukasi', icon: BookOpen },
  { id: 'entertainment', label: '🎬 Anime & Hiburan', icon: Film },
  { id: 'games', label: '🎮 Games & Kuis', icon: Gamepad2 },
  { id: 'doc-img', label: '📄 PDF & Image Tools', icon: FileText }
];

// Helper to get friendly title and icon
function getFriendlyToolMeta(tool: any) {
  const cat = (tool.category || '').toLowerCase();
  const name = tool.name || '';
  const path = (tool.path || tool.fullPath || '').toLowerCase();

  let categoryLabel = 'Utilitas';
  let badge = 'Fitur Siap Pakai';
  let icon = Zap;

  if (cat.includes('textpro') || cat.includes('maker') || path.includes('textpro') || path.includes('maker') || path.includes('ephoto')) {
    categoryLabel = 'Graphic & Text Generator';
    badge = 'Instant Graphic';
    icon = Palette;
  } else if (cat.includes('ai') || path.includes('/ai/')) {
    categoryLabel = 'Kecerdasan Buatan (AI)';
    badge = 'AI Powered';
    icon = Bot;
  } else if (cat.includes('downloader') || path.includes('/downloader/')) {
    categoryLabel = 'Media Downloader';
    badge = 'Lossless HD';
    icon = Download;
  } else if (cat.includes('stalker') || path.includes('stalker')) {
    categoryLabel = 'Sosmed Profiler';
    badge = 'Cek Data Akun';
    icon = UserCheck;
  } else if (cat.includes('spotify') || path.includes('spotify') || path.includes('music')) {
    categoryLabel = 'Audio & Musik';
    badge = '320kbps Audio';
    icon = Music;
  } else if (cat.includes('agama') || path.includes('quran') || path.includes('jadwal-sholat') || path.includes('doa')) {
    categoryLabel = 'Islami & Ibadah';
    badge = 'Islami';
    icon = BookOpen;
  } else if (cat.includes('anime') || cat.includes('film') || cat.includes('berita')) {
    categoryLabel = 'Entertainment';
    badge = 'Media Hub';
    icon = Film;
  } else if (cat.includes('game') || cat.includes('primbon')) {
    categoryLabel = 'Games & Hiburan';
    badge = 'Interactive';
    icon = Gamepad2;
  } else if (cat.includes('pdf') || cat.includes('ilovepdf') || cat.includes('iloveimg')) {
    categoryLabel = 'Dokumen & Gambar';
    badge = 'Quick Tool';
    icon = FileText;
  }

  return { categoryLabel, badge, icon };
}

export const ToolsExplorer: React.FC = () => {
  const { isLoggedIn, isAgeVerified, requestAdultAccess } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24;

  // Adult(18+) tools are excluded from every listing/search result entirely
  // (not just visually hidden) unless the signed-in user has completed 21+
  // age verification — per spec, unregistered/unverified users must never
  // see these tools exist at all. The server independently re-enforces this
  // in app/api/xean-service/route.ts, so this filter is about UX, not the
  // actual security boundary.
  const isAdultUnlocked = isLoggedIn && isAgeVerified;
  const visibleEndpoints = useMemo(
    () => (isAdultUnlocked ? allEndpoints : allEndpoints.filter((e) => e.category !== 'adult(18+)')),
    [isAdultUnlocked]
  );

  const filteredItems = useMemo(() => {
    let list: any[] = [];

    if (selectedCategory === 'featured') {
      list = FEATURED_TOOLS;
    } else if (selectedCategory === 'all') {
      list = visibleEndpoints;
    } else if (selectedCategory === 'textpro-maker') {
      list = visibleEndpoints.filter(e => e.category === 'textpro' || e.category === 'maker');
    } else if (selectedCategory === 'ai-suite') {
      list = visibleEndpoints.filter(e => e.category === 'ai' || e.category === 'ai-image');
    } else if (selectedCategory === 'downloader') {
      list = visibleEndpoints.filter(e => e.category === 'downloader');
    } else if (selectedCategory === 'stalker') {
      list = visibleEndpoints.filter(e => e.category === 'stalker');
    } else if (selectedCategory === 'tools-web') {
      list = visibleEndpoints.filter(e => e.category === 'tools' || e.category === 'search' || e.category === 'aplikasi' || e.category === 'info');
    } else if (selectedCategory === 'spotify-audio') {
      list = visibleEndpoints.filter(e => e.category === 'spotify');
    } else if (selectedCategory === 'agama') {
      list = visibleEndpoints.filter(e => e.category === 'agama');
    } else if (selectedCategory === 'entertainment') {
      list = visibleEndpoints.filter(e => e.category === 'anime' || e.category === 'film' || e.category === 'berita');
    } else if (selectedCategory === 'games') {
      list = visibleEndpoints.filter(e => e.category === 'games' || e.category === 'primbon' || e.category === 'random');
    } else if (selectedCategory === 'doc-img') {
      list = visibleEndpoints.filter(e => e.category === 'iloveimg' || e.category === 'ilovepdf');
    } else {
      list = visibleEndpoints.filter((item) => item.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.category?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [searchQuery, selectedCategory, visibleEndpoints]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  const handleOpenTool = (tool: any) => {
    // Defense in depth: even though visibleEndpoints already excludes
    // adult(18+) tools for locked users, guard the open action itself too.
    if (tool.category === 'adult(18+)' && !isAdultUnlocked) {
      requestAdultAccess();
      return;
    }
    setSelectedTool(tool);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto space-y-3 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-none text-[11px] font-mono bg-white text-ink/80 border-2 border-ink">
          <Zap className="w-3.5 h-3.5 text-forest" />
          <span>334+ Fitur & Utilitas Digital Aktif</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif text-ink font-extrabold tracking-tight">
          Pusat Fitur & Alat Digital
        </h2>
        <p className="text-xs sm:text-sm text-ink/65 font-medium leading-relaxed">
          Semua fitur dapat langsung dijalankan dan digunakan di browser Anda — mulai dari generator logo 3D, AI Image Generator, stalker akun sosmed, downloader media HD, hingga utilitas islami dan web tools praktis.
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white border-2 border-ink rounded-none p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="flex-1 relative flex items-center bg-paper border-2 border-ink rounded-none px-4 py-3 transition-all">
            <Search className="w-4 h-4 text-ink/65 shrink-0" />
            <input
              type="text"
              id="tools-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari fitur (contoh: stalker ig, logo 3d, remove background, textpro, quran, flux ai)..."
              className="w-full bg-transparent text-xs sm:text-sm text-ink placeholder:text-ink/45 focus:outline-none ml-2.5 font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs font-mono text-ink/65 hover:text-ink px-2"
              >
                Reset
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-ink/65">
            <span className="bg-paper px-4 py-2.5 rounded-none border-2 border-ink font-mono text-[11px] text-forest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-volt animate-pulse"></span>
              {filteredItems.length} Fitur Siap Dijalankan
            </span>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
          {CATEGORY_MAP.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const IconComp = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setCurrentPage(1);
                }}
                className={`border-2 px-4 py-2 rounded-none text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-white text-black font-bold shadow-md border-ink'
                    : 'bg-paper text-ink/65 hover:text-ink hover:bg-sun border-2 border-ink shadow-sm'
                }`}
              >
                <IconComp className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredItems.length === 0 ? (
        <div className="shadow-lg p-14 text-center bg-white border-2 border-ink rounded-none space-y-3">
          <SlidersHorizontal className="w-10 h-10 text-ink/55 mx-auto" />
          <h4 className="text-base font-serif text-ink">Tidak ada fitur yang cocok</h4>
          <p className="text-xs text-ink/65 max-w-sm mx-auto font-medium">
            Coba gunakan kata kunci pencarian yang berbeda atau pilih kategori "Semua Fitur".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {paginatedItems.map((tool: any, idx: number) => {
            const meta = getFriendlyToolMeta(tool);
            const IconComp = meta.icon;

            return (
              <div
                key={tool.id || idx}
                onClick={() => handleOpenTool(tool)}
                className="group p-5 sm:p-6 rounded-none bg-white border-2 border-ink hover:bg-sun transition-all cursor-pointer flex flex-col justify-between gap-4 shadow-sm relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-none bg-paper border-2 border-ink text-ink/80 group-hover:text-ink transition-colors">
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-none text-[11px] font-mono bg-paper text-ink/80 border-2 border-ink">
                        {meta.categoryLabel}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-forest bg-mint border-2 border-ink px-2 py-0.5 rounded-none">
                      {meta.badge}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-ink group-hover:text-ink/80 transition-colors line-clamp-1 tracking-wide font-sans">
                    {tool.name}
                  </h3>

                  <p className="text-xs text-ink/65 line-clamp-2 leading-relaxed font-medium">
                    {tool.description || 'Gunakan fitur interaktif ini secara langsung di web Anda.'}
                  </p>
                </div>

                <div className="border-dashed pt-3.5 border-t border-ink flex items-center justify-between">
                  <span className="text-[11px] text-ink/55 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-volt"></span>
                    Siap Dijalankan
                  </span>

                  <button
                    type="button"
                    className="border-2 border-ink flex items-center gap-1.5 px-4 py-1.5 rounded-none bg-white group-hover:bg-iris text-black group-hover:text-ink text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm"
                  >
                    <span>Jalankan</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-none text-xs font-mono bg-white border-2 border-ink text-ink/80 hover:bg-sun hover:text-ink disabled:opacity-30 transition-all cursor-pointer"
          >
            Sebelumnya
          </button>

          <span className="text-xs font-mono text-ink/65 px-3">
            Halaman <strong className="text-ink">{currentPage}</strong> dari {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-none text-xs font-mono bg-white border-2 border-ink text-ink/80 hover:bg-sun hover:text-ink disabled:opacity-30 transition-all cursor-pointer"
          >
            Selanjutnya
          </button>
        </div>
      )}

      {/* Interactive Modal Feature Studio */}
      {selectedTool && (
        <InteractiveToolModal
          tool={selectedTool}
          onClose={() => setSelectedTool(null)}
        />
      )}
    </div>
  );
};