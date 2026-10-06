'use client';

import React from 'react';
import {
  Lock,
  ExternalLink
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t-4 border-ink bg-ink text-white text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-volt text-ink font-mono font-bold flex items-center justify-center text-base border-2 border-white -rotate-6">
                X
              </div>
              <span className="font-serif text-2xl font-extrabold text-white tracking-tight">
                Xean Digital
              </span>
            </div>

            <p className="text-xs text-white/75 font-medium leading-relaxed max-w-md">
              Comprehensive digital ecosystem, high-speed unified media downloader, and enterprise digital utility suite. Engineered for extreme reliability and privacy.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-white/70 font-mono pt-1">
              <Lock className="w-3.5 h-3.5 text-iris" />
              <span>Full Privacy — Server-side token masking & SSL encrypted pipelines</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-extrabold text-volt">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a href="#downloader" className="text-white/80 hover:text-volt underline decoration-2 underline-offset-4">
                  All Media Downloader
                </a>
              </li>
              <li>
                <a href="#tools" className="text-white/80 hover:text-volt underline decoration-2 underline-offset-4">
                  334+ Pusat Fitur & Utilitas Digital
                </a>
              </li>
              <li>
                <a href="#ai" className="text-white/80 hover:text-volt underline decoration-2 underline-offset-4">
                  Xean AI Studio & Synthesis
                </a>
              </li>
              <li>
                <a href="#spotify" className="text-white/80 hover:text-volt underline decoration-2 underline-offset-4">
                  Spotify 320kbps Music Suite
                </a>
              </li>
            </ul>
          </div>

          {/* Creator & Agency */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-extrabold text-volt">
              Principal Architect
            </h4>
            <div className="p-4 bg-white border-2 border-white shadow-[6px_6px_0_0_var(--color-iris)] space-y-2">
              <div className="text-sm font-extrabold text-ink">
                Syamil Alkhattab
              </div>
              <div className="text-[11px] text-ink/70 font-mono">
                Ahli Informatika & System Architect
              </div>
              <div className="pt-1">
                <a
                  href="https://xeandigital.web.id"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-ink hover:bg-sun font-mono font-bold underline decoration-2 underline-offset-2"
                >
                  <span>xeandigital.web.id</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t-2 border-dashed border-white/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-white/70 font-mono">
          <div>
            © {new Date().getFullYear()} <strong className="text-white">Xean Digital</strong>. Seluruh hak cipta dilindungi. Karya dari Xean & Di-idei oleh Syamil Alkhattab.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-volt font-bold">
              <span className="w-2 h-2 rounded-full bg-volt animate-pulse"></span>
              Core Systems: Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
