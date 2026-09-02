'use client';

import React from 'react';
import { 
  Code2, 
  Bot, 
  Cloud, 
  Cpu, 
  ExternalLink, 
  CheckCircle,
  Sparkles,
  Award
} from 'lucide-react';

export const DigitalServicesHub: React.FC = () => {
  const services = [
    {
      icon: <DownloadIcon className="w-5 h-5 text-white" />,
      title: 'Media Downloader & Scraping Engine',
      description: 'Custom high-speed downloader backend API architecture for TikTok, IG, YouTube, Spotify, and TeraBox with rate-limit bypass and lossless output.',
      badge: 'Core Engine'
    },
    {
      icon: <Code2 className="w-5 h-5 text-white" />,
      title: 'Modern Web & Fullstack Application',
      description: 'Enterprise web portals, SaaS platforms, and bespoke digital infrastructure built with React, Next.js, Express, and Tailwind CSS.',
      badge: 'Fullstack'
    },
    {
      icon: <Bot className="w-5 h-5 text-white" />,
      title: 'Automated Messaging & Workflow Bots',
      description: '24/7 intelligent automation bots for WhatsApp, Telegram, and Discord with integrated payment gateways and AI processing.',
      badge: 'Automation'
    },
    {
      icon: <Cloud className="w-5 h-5 text-white" />,
      title: 'Cloud DevOps & High-Availability Deployments',
      description: 'Bespoke Linux VPS tuning, Docker containerization, custom domain routing, SSL hardening, and serverless Vercel architectures.',
      badge: 'DevOps'
    },
    {
      icon: <Cpu className="w-5 h-5 text-white" />,
      title: 'AI Synthesis & Private REST Gateways',
      description: 'Secure server-side LLM proxies (Gemini, ChatGPT, Flux AI), token obfuscation, and custom encrypted microservice layers.',
      badge: 'AI & API'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-white" />,
      title: 'Bespoke Digital Assets & Technology Consulting',
      description: 'SEO strategy, infrastructure optimization, high-yield digital workflows, and specialized IT architecture consultation.',
      badge: 'Consulting'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Presentation Banner */}
      <div className="relative rounded-3xl bg-[#0D0D0D] border border-[#ffffff12] p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.3em] bg-[#111111] text-[#AAA] border border-[#ffffff12]">
              <Award className="w-3.5 h-3.5 text-[#4F46E5]" />
              <span>Official Ecosystem • Xean Digital</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif italic text-white font-normal leading-tight tracking-tight">
              Comprehensive Digital Solutions Hub
            </h2>

            <p className="text-xs sm:text-sm text-[#888] font-light leading-relaxed">
              Xean Digital serves as Indonesia's premier digital infrastructure hub. Engineered with rigorous performance standards, bulletproof security, and complete server-side privacy.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-[#00FF88]">
                <CheckCircle className="w-4 h-4" /> 100% Encrypted & Private
              </span>
              <span className="flex items-center gap-1.5 text-[#AAA]">
                <CheckCircle className="w-4 h-4" /> 334+ Unified Endpoints
              </span>
            </div>
          </div>

          {/* Owner Profile Badge */}
          <div className="bg-[#050505] border border-[#ffffff12] p-6 rounded-3xl shadow-xl space-y-4 max-w-xs text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-[#141414] border border-[#ffffff15] flex items-center justify-center text-white font-mono font-bold text-xl shadow-lg">
              SA
            </div>

            <div>
              <h3 className="font-serif italic text-white text-lg">Syamil Alkhattab</h3>
              <p className="text-xs text-[#AAA] font-mono uppercase tracking-wider mt-0.5">Principal Architect & Founder</p>
              <p className="text-[11px] text-[#666] font-light mt-1">
                Conceptual Architect of Xean Digital
              </p>
            </div>

            <a
              href="https://xeandigital.web.id"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-black bg-white hover:bg-[#4F46E5] hover:text-white px-5 py-2.5 rounded-full uppercase tracking-wider transition-all w-full justify-center shadow-md cursor-pointer"
            >
              <span>Visit Official Site</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-4xl font-serif italic text-white font-normal">
            Digital Engineering Catalog
          </h3>
          <p className="text-xs text-[#888] font-light">
            Engineered software solutions, cloud architectures, automated bots, and bespoke digital tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-[#0D0D0D] border border-[#ffffff08] hover:border-[#ffffff18] transition-all space-y-4 group shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#050505] border border-[#ffffff08] group-hover:border-[#ffffff15] transition-colors">
                    {svc.icon}
                  </div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#050505] text-[#888] border border-[#ffffff08]">
                    {svc.badge}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white group-hover:text-[#CCC] transition-colors font-sans">
                  {svc.title}
                </h4>

                <p className="text-xs text-[#777] font-light leading-relaxed">
                  {svc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consultation Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-[#0D0D0D] border border-[#ffffff08] text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-serif italic text-white">
          Require Custom Digital Architecture or Enterprise Solutions?
        </h3>
        <p className="text-xs sm:text-sm text-[#888] font-light max-w-xl mx-auto leading-relaxed">
          Connect with Syamil Alkhattab and the Xean Digital team for custom web engineering, private REST API integrations, Vercel deployments, automation bots, and full-spectrum digital infrastructure.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="https://xeandigital.web.id"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-7 py-3 rounded-full bg-white hover:bg-[#4F46E5] hover:text-white text-black font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
          >
            <span>Consult Xean Digital</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};

function DownloadIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </svg>
  );
}