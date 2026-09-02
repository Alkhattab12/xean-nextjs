'use client';

import React from 'react';
import { 
  Lock, 
  ExternalLink
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-[#ffffff08] bg-[#050505] text-[#888] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-black font-mono font-bold flex items-center justify-center text-sm shadow-md">
                X
              </div>
              <span className="font-serif italic text-xl text-white tracking-wide">
                Xean Digital
              </span>
            </div>

            <p className="text-xs text-[#777] font-light leading-relaxed max-w-md">
              Comprehensive digital ecosystem, high-speed unified media downloader, and enterprise digital utility suite. Engineered for extreme reliability and privacy.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-[#555] font-mono pt-1">
              <Lock className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>Full Privacy — Server-side token masking & SSL encrypted pipelines</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs font-light">
              <li>
                <a href="#downloader" className="hover:text-white transition-colors">
                  All Media Downloader
                </a>
              </li>
              <li>
                <a href="#tools" className="hover:text-white transition-colors">
                  334+ Pusat Fitur & Utilitas Digital
                </a>
              </li>
              <li>
                <a href="#ai" className="hover:text-white transition-colors">
                  Xean AI Studio & Synthesis
                </a>
              </li>
              <li>
                <a href="#spotify" className="hover:text-white transition-colors">
                  Spotify 320kbps Music Suite
                </a>
              </li>
            </ul>
          </div>

          {/* Creator & Agency */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-[0.2em] text-white">
              Principal Architect
            </h4>
            <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-[#ffffff08] space-y-2">
              <div className="text-xs font-bold text-white">
                Syamil Alkhattab
              </div>
              <div className="text-[11px] text-[#888] font-mono">
                Ahli Informatika & System Architect
              </div>
              <div className="pt-1">
                <a
                  href="https://xeandigital.web.id"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-[#AAA] hover:text-white transition-colors font-mono uppercase tracking-wider underline"
                >
                  <span>xeandigital.web.id</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#ffffff08] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#555] font-mono">
          <div>
            © {new Date().getFullYear()} <strong className="text-[#888]">Xean Digital</strong>. Seluruh hak cipta dilindungi. Karya dari Xean & Di-idei oleh Syamil Alkhattab.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#00FF88]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse"></span>
              Core Systems: Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};