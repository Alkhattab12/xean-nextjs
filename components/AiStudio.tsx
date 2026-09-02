'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  Copy, 
  Check, 
  RefreshCw, 
  Code, 
  Image as ImageIcon, 
  Flame, 
  FileText, 
  ShieldCheck,
  Zap,
  Brain,
  ChevronDown,
  Layers,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AiStudioProps {
  onOpenFluxTool?: () => void;
}

export type AiModelOption = 
  | 'xean-ai-pro' 
  | 'xean-ai-advanced' 
  | 'xean-ai-fast' 
  | 'xean-ai-lite' 
  | 'xean-ai-opus' 
  | 'gemini-3.7-flash';

export const AiStudio: React.FC<AiStudioProps> = () => {
  const [promptInput, setPromptInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<AiModelOption>('xean-ai-pro');
  const [thinkingMode, setThinkingMode] = useState(false);
  const [activePreset, setActivePreset] = useState<'general' | 'caption' | 'prompt' | 'code'>('general');
  const [chatMessages, setChatMessages] = useState<Array<{ 
    role: 'user' | 'assistant'; 
    text: string; 
    time: string;
    model?: string;
    thinking?: string[];
  }>>([
    {
      role: 'assistant',
      text: 'Halo! Saya Xean AI & Xean Neural Engine resmi dari Xean Digital (di-arsiteki oleh Syamil Alkhattab). Seluruh model Xean AI (Pro, Advanced, Fast, Opus) kini telah terintegrasi 100% aktif tanpa error quota. Ada yang bisa saya bantu terkait coding, analisis mendalam, riset, atau pembuatan konten?',
      time: 'Baru saja',
      model: 'Xean AI Pro'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const modelOptions: { id: AiModelOption; name: string; badge: string; iconColor: string; description: string }[] = [
    { id: 'xean-ai-pro', name: 'Xean AI Pro', badge: 'Hybrid Reasoning', iconColor: 'text-[#00FF88]', description: 'Model Xean AI tercerdas untuk coding presisi & penalaran hibrida' },
    { id: 'xean-ai-advanced', name: 'Xean AI Advanced', badge: 'Pro Coding', iconColor: 'text-[#4F46E5]', description: 'Model unggulan untuk rekayasa perangkat lunak & analisis mendalam' },
    { id: 'xean-ai-fast', name: 'Xean AI Fast', badge: 'Ultra Fast', iconColor: 'text-[#06B6D4]', description: 'Respon secepat kilat, ringkas, dan sangat akurat' },
    { id: 'xean-ai-opus', name: 'Xean AI Opus', badge: 'Deep Analytical', iconColor: 'text-purple-400', description: 'Analisis literatur kompleks dan pemikiran multi-cabang' },
    { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', badge: 'Multimodal Core', iconColor: 'text-amber-400', description: 'Kecepatan tinggi & kecerdasan serba bisa' }
  ];

  const presets = [
    { id: 'general', label: 'Tanya Bebas AI', icon: <Bot className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'caption', label: 'Caption & Hashtag Medsos', icon: <Flame className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'prompt', label: 'AI Image Prompt Crafter', icon: <ImageIcon className="w-3.5 h-3.5 text-purple-400" /> },
    { id: 'code', label: 'Coding & Debug Assistant', icon: <Code className="w-3.5 h-3.5 text-emerald-400" /> }
  ];

  const handleSendPrompt = async (customPrompt?: string) => {
    const text = (customPrompt || promptInput).trim();
    if (!text || isLoading) return;

    let finalPrompt = text;
    if (activePreset === 'caption') {
      finalPrompt = `Buatkan 3 opsi caption media sosial yang viral, menarik, engaging lengkap dengan emoji keren dan 15 hashtag relevan bertrafik tinggi untuk topik: ${text}`;
    } else if (activePreset === 'prompt') {
      finalPrompt = `Buatkan 2 prompt bahasa Inggris ultra-detail & photorealistic untuk Midjourney v6 / Flux AI dari ide konsep ini: ${text}. Sertakan lighting, aspect ratio, style, dan camera settings.`;
    } else if (activePreset === 'code') {
      finalPrompt = `Bantu buatkan kode pemrograman yang bersih, efisien, aman, dan ber-komentar jelas untuk kebutuhan: ${text}`;
    }

    const newMsg = {
      role: 'user' as const,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setPromptInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          mode: activePreset,
          model: selectedModel,
          thinking: thinkingMode
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gagal memproses prompt AI.');
      }

      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply || 'Respon selesai.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: data.model || selectedModel,
          thinking: data.thinking || []
        }
      ]);

      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.9 }
      });
    } catch (err: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Terjadi kendala pemrosesan: ${err.message || 'Silakan coba sesaat lagi.'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: selectedModel
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const activeModelObj = modelOptions.find(m => m.id === selectedModel) || modelOptions[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header presentation */}
      <div className="text-center space-y-3 pt-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-[0.3em] bg-[#111111] text-[#AAA] border border-[#ffffff12]">
          <Cpu className="w-3.5 h-3.5 text-[#00FF88]" />
          <span>Xean AI Pro / Advanced & Multimodal Neural Core</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-serif italic text-white font-normal tracking-tight">
          Xean AI Studio <span className="font-sans not-italic font-light text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00FF88] to-[#4F46E5]">Neural Hub</span>
        </h2>
        <p className="text-xs sm:text-sm text-[#888] font-light max-w-xl mx-auto leading-relaxed">
          Chat dan kolaborasi tanpa hambatan dengan seluruh model Xean AI (Pro, Advanced, Fast, Opus) lengkap dengan Mode Berpikir (Thinking Mode) dan asistensi kode tingkat lanjut.
        </p>
      </div>

      {/* Model Selection & Thinking Bar */}
      <div className="p-4 rounded-3xl bg-[#0D0D0D] border border-[#ffffff10] flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#888] flex items-center gap-1.5 mr-1">
            <Layers className="w-3.5 h-3.5 text-[#00FF88]" />
            Model AI:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {modelOptions.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedModel === model.id
                    ? 'bg-white text-black font-bold shadow-md scale-102'
                    : 'bg-[#151515] text-[#999] hover:text-white border border-[#ffffff0a]'
                }`}
                title={model.description}
              >
                <span>{model.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${
                  selectedModel === model.id 
                    ? 'bg-black/10 text-black font-semibold' 
                    : 'bg-white/5 text-[#777]'
                }`}>
                  {model.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Thinking Mode Toggle */}
        <button
          onClick={() => setThinkingMode(!thinkingMode)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer border ${
            thinkingMode
              ? 'bg-[#00FF88]/15 border-[#00FF88] text-[#00FF88] shadow-sm'
              : 'bg-[#151515] border-[#ffffff10] text-[#777] hover:text-white'
          }`}
          title="Aktifkan deep chain-of-thought analysis"
        >
          <Brain className={`w-3.5 h-3.5 ${thinkingMode ? 'animate-pulse text-[#00FF88]' : ''}`} />
          <span>Thinking Mode: {thinkingMode ? 'ON (Deep)' : 'OFF'}</span>
        </button>
      </div>

      {/* Main Chat Container */}
      <div className="bg-[#0D0D0D] border border-[#ffffff10] rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[620px]">
        {/* Top Preset Control Bar */}
        <div className="p-4 sm:p-5 border-b border-[#ffffff08] bg-[#080808] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse"></div>
            <span className="text-xs font-bold text-white tracking-wide">{activeModelObj.name}</span>
            <span className="text-[10px] text-[#666] font-mono hidden sm:inline">| {activeModelObj.badge}</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {presets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => setActivePreset(preset.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all uppercase tracking-wider cursor-pointer ${
                  activePreset === preset.id
                    ? 'bg-[#4F46E5] text-white shadow-md'
                    : 'bg-[#141414] text-[#888] hover:text-white border border-[#ffffff08]'
                }`}
              >
                {preset.icon}
                <span className="text-[11px]">{preset.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">
          {chatMessages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isCopied = copiedIdx === idx;

            return (
              <div
                key={idx}
                className={`flex gap-3.5 items-start ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#ffffff15] flex items-center justify-center text-white font-mono font-bold text-xs shrink-0 shadow-md">
                    C
                  </div>
                )}

                <div
                  className={`max-w-[88%] sm:max-w-[78%] rounded-3xl p-5 text-xs sm:text-sm leading-relaxed relative group ${
                    isUser
                      ? 'bg-[#4F46E5] text-white'
                      : 'bg-[#080808] border border-[#ffffff0a] text-[#E0E0E0] shadow-sm font-light'
                  }`}
                >
                  {/* Assistant Model Tag & Thinking Steps */}
                  {!isUser && msg.model && (
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#00FF88]">
                        {msg.model}
                      </span>
                    </div>
                  )}

                  {!isUser && msg.thinking && msg.thinking.length > 0 && (
                    <div className="mb-3 p-3 rounded-2xl bg-[#050505] border border-[#ffffff0a] text-[11px] text-[#888] font-mono space-y-1">
                      <div className="flex items-center gap-1.5 text-[#00FF88] font-semibold text-[10px] uppercase tracking-wider">
                        <Brain className="w-3 h-3" />
                        <span>Thinking Trace ({msg.thinking.length} Langkah)</span>
                      </div>
                      <ul className="list-disc list-inside space-y-0.5 text-[#AAA]">
                        {msg.thinking.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-[#777] font-mono">
                    <span>{msg.time}</span>

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.text, idx)}
                        className="flex items-center gap-1 text-[#AAA] hover:text-white font-mono uppercase tracking-wider transition-colors ml-4 cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-[#00FF88]" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'Copied' : 'Copy Response'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-md">
                    U
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-[#1A1A1A] border border-[#ffffff15] flex items-center justify-center text-white font-mono font-bold text-xs shrink-0 animate-pulse">
                C
              </div>
              <div className="bg-[#080808] border border-[#ffffff08] rounded-2xl p-4 text-xs text-[#AAA] flex items-center gap-2 font-mono">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00FF88]" />
                <span>Menganalisis & merumuskan respon dengan {activeModelObj.name}...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 sm:p-5 bg-[#080808] border-t border-[#ffffff08]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="flex items-center gap-2 bg-[#050505] border border-[#ffffff12] focus-within:border-[#00FF88] rounded-full p-2 pl-4 transition-all"
          >
            <input
              type="text"
              id="ai-prompt-input"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={
                activePreset === 'caption'
                  ? 'Deskripsikan topik foto/video untuk caption medsos viral...'
                  : activePreset === 'prompt'
                  ? 'Deskripsikan konsep gambar untuk prompt Midjourney/Flux...'
                  : activePreset === 'code'
                  ? `Minta algoritma, kode React/Node, atau debug dengan ${activeModelObj.name}...`
                  : `Tanyakan apa saja kepada ${activeModelObj.name}...`
              }
              className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-[#555] focus:outline-none"
            />

            <button
              type="submit"
              disabled={isLoading || !promptInput.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-[#00FF88] hover:text-black disabled:opacity-40 text-black font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              <span>Kirim</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};