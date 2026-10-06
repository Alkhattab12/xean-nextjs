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
      icon: <DownloadIcon className="w-5 h-5 text-ink" />,
      title: 'Media Downloader & Scraping Engine',
      description: 'Custom high-speed downloader backend API architecture for TikTok, IG, YouTube, Spotify, and TeraBox with rate-limit bypass and lossless output.',
      badge: 'Core Engine'
    },
    {
      icon: <Code2 className="w-5 h-5 text-ink" />,
      title: 'Modern Web & Fullstack Application',
      description: 'Enterprise web portals, SaaS platforms, and bespoke digital infrastructure built with React, Next.js, Express, and Tailwind CSS.',
      badge: 'Fullstack'
    },
    {
      icon: <Bot className="w-5 h-5 text-ink" />,
      title: 'Automated Messaging & Workflow Bots',
      description: '24/7 intelligent automation bots for WhatsApp, Telegram, and Discord with integrated payment gateways and AI processing.',
      badge: 'Automation'
    },
    {
      icon: <Cloud className="w-5 h-5 text-ink" />,
      title: 'Cloud DevOps & High-Availability Deployments',
      description: 'Bespoke Linux VPS tuning, Docker containerization, custom domain routing, SSL hardening, and serverless Vercel architectures.',
      badge: 'DevOps'
    },
    {
      icon: <Cpu className="w-5 h-5 text-ink" />,
      title: 'AI Synthesis & Private REST Gateways',
      description: 'Secure server-side LLM proxies (Gemini, ChatGPT, Flux AI), token obfuscation, and custom encrypted microservice layers.',
      badge: 'AI & API'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-ink" />,
      title: 'Bespoke Digital Assets & Technology Consulting',
      description: 'SEO strategy, infrastructure optimization, high-yield digital workflows, and specialized IT architecture consultation.',
      badge: 'Consulting'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* Presentation Banner */}
      <div className="relative rounded-none bg-white border-2 border-ink p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-none text-[11px] font-mono bg-white text-ink/80 border-2 border-ink">
              <Award className="w-3.5 h-3.5 text-irisdeep" />
              <span>Official Ecosystem • Xean Digital</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-serif text-ink font-extrabold leading-tight tracking-tight">
              Comprehensive Digital Solutions Hub
            </h2>

            <p className="text-xs sm:text-sm text-ink/65 font-medium leading-relaxed">
              Xean Digital serves as Indonesia's premier digital infrastructure hub. Engineered with rigorous performance standards, bulletproof security, and complete server-side privacy.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-forest">
                <CheckCircle className="w-4 h-4" /> 100% Encrypted & Private
              </span>
              <span className="flex items-center gap-1.5 text-ink/80">
                <CheckCircle className="w-4 h-4" /> 334+ Unified Endpoints
              </span>
            </div>
          </div>

          {/* Owner Profile Badge */}
          <div className="bg-paper border-2 border-ink p-6 rounded-none shadow-xl space-y-4 max-w-xs text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-paper border-2 border-ink flex items-center justify-center text-ink font-mono font-bold text-xl shadow-lg">
              SA
            </div>

            <div>
              <h3 className="font-serif text-ink text-lg">Syamil Alkhattab</h3>
              <p className="text-xs text-ink/80 font-mono mt-0.5">Principal Architect & Founder</p>
              <p className="text-[11px] text-ink/65 font-medium mt-1">
                Conceptual Architect of Xean Digital
              </p>
            </div>

            <a
              href="https://xeandigital.web.id"
              target="_blank"
              rel="noreferrer"
              className="border-2 border-ink inline-flex items-center gap-1.5 text-xs font-bold text-black bg-white hover:bg-iris hover:text-ink px-5 py-2.5 rounded-none uppercase tracking-wider transition-all w-full justify-center shadow-md cursor-pointer"
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
          <h3 className="text-2xl sm:text-4xl font-serif text-ink font-extrabold">
            Digital Engineering Catalog
          </h3>
          <p className="text-xs text-ink/65 font-medium">
            Engineered software solutions, cloud architectures, automated bots, and bespoke digital tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((svc, idx) => (
            <div
              key={idx}
              className="p-6 rounded-none bg-white border-2 border-ink transition-all space-y-4 group shadow-sm flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="shadow-lg p-3 rounded-none bg-paper border-2 border-ink transition-colors">
                    {svc.icon}
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-none bg-paper text-ink/65 border-2 border-ink">
                    {svc.badge}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-ink group-hover:text-ink/80 transition-colors font-sans">
                  {svc.title}
                </h4>

                <p className="text-xs text-ink/65 font-medium leading-relaxed">
                  {svc.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consultation Banner */}
      <div className="shadow-lg p-8 sm:p-10 rounded-none bg-white border-2 border-ink text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-serif text-ink">
          Require Custom Digital Architecture or Enterprise Solutions?
        </h3>
        <p className="text-xs sm:text-sm text-ink/65 font-medium max-w-xl mx-auto leading-relaxed">
          Connect with Syamil Alkhattab and the Xean Digital team for custom web engineering, private REST API integrations, Vercel deployments, automation bots, and full-spectrum digital infrastructure.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="https://xeandigital.web.id"
            target="_blank"
            rel="noreferrer"
            className="border-2 border-ink flex items-center gap-2 px-7 py-3 rounded-none bg-white hover:bg-iris hover:text-ink text-black font-bold text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer"
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