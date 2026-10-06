// Adapted from the original server.ts's `generateClaudeResponse()`.
//
// IMPORTANT CHANGE FROM THE ORIGINAL: the source app's function generated
// text with Google's Gemini API, but wrapped every call in a system prompt
// literally instructing Gemini to "Vous are Claude 3.7 Sonnet, Anthropic's
// most intelligent..." and returned fabricated model IDs (claude-3-7-sonnet,
// claude-3-opus, etc.) and fake "Claude-precision thinking steps" to the
// end user — i.e. it presented Gemini's output as genuine Anthropic Claude
// output. That's brand impersonation of a real product, not a technical
// detail, so it was not ported as-is. This version keeps 100% of the actual
// engineering (the same Gemini call, the same model-tier fallback cascade,
// the same Thinking Mode toggle, the same response shape) but is honest
// about what's generating the text: an in-house "Xean AI" assistant
// powered by Gemini. See app/api/xean-service/route.ts and
// app/api/ai-chat/route.ts for where this is called, and
// components/AiStudio.tsx + data/featuredTools.ts for the matching
// front-end copy change.
import { GoogleGenAI } from '@google/genai';

export interface AiAssistantResult {
  success: boolean;
  status: 'success';
  conversationId: string;
  model: string;
  content: string;
  thinking: string[];
  files: any[];
  creator: string;
}

export async function generateAiAssistantResponse({
  message,
  model = 'xean-ai-pro',
  thinking = false,
  image
}: {
  message: string;
  model?: string;
  thinking?: boolean;
  image?: string;
}): Promise<AiAssistantResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    throw new Error('API Key Gemini untuk Xean AI Engine tidak ditemukan.');
  }

  const cleanModel = (model || 'xean-ai-pro').toLowerCase();
  let modelLabel = 'xean-ai-pro';
  let systemPersona = '';
  let thinkingSteps: string[] = [];

  const isThinkingActive = String(thinking) === 'true' || thinking === true;

  if (cleanModel.includes('pro') || cleanModel.includes('3-7') || cleanModel.includes('3.7')) {
    modelLabel = 'xean-ai-pro';
    systemPersona = `You are Xean AI Pro, Xean Digital's hybrid-reasoning assistant for advanced coding and analysis, built on Google's Gemini models.
You excel at deeply reasoned insights, world-class software architecture, mathematical clarity, and articulate, helpful explanations in Indonesian and English.
Always format your answers with clean markdown headings, structured bullet points, and syntax-highlighted code blocks where appropriate.`;
    if (isThinkingActive) {
      thinkingSteps = [
        'Menganalisis premis dan parameter kompleksitas instruksi pengguna...',
        'Memetakan arsitektur solusi dan konteks teknis...',
        'Menyusun sintesis logika bertahap dengan presisi Xean AI Pro...',
        'Memvalidasi kelengkapan konten, format markdown, dan kejelasan solusi...'
      ];
    }
  } else if (cleanModel.includes('advanced') || cleanModel.includes('sonnet')) {
    modelLabel = 'xean-ai-advanced';
    systemPersona = `You are Xean AI Advanced, Xean Digital's premier assistant renowned for superior coding, analytical reasoning, and exceptional clarity, built on Google's Gemini models. Respond in fluent Indonesian and English with precision and helpfulness.`;
  } else if (cleanModel.includes('fast') || cleanModel.includes('haiku') || cleanModel.includes('lite')) {
    modelLabel = cleanModel.includes('lite') ? 'xean-ai-lite' : 'xean-ai-fast';
    systemPersona = `You are Xean AI Fast, Xean Digital's ultra-fast, concise, and highly effective assistant, built on Google's Gemini models. Provide direct, crisp, and insightful answers.`;
  } else if (cleanModel.includes('opus') || cleanModel.includes('deep')) {
    modelLabel = 'xean-ai-opus';
    systemPersona = `You are Xean AI Opus, Xean Digital's powerhouse assistant for deep multi-domain analysis, academic rigor, and nuanced conceptual synthesis, built on Google's Gemini models.`;
  } else {
    modelLabel = cleanModel;
    systemPersona = `You are Xean AI, Xean Digital's assistant built on Google's Gemini models. Provide smart, articulate, and accurate assistance.`;
  }

  const ai = new GoogleGenAI({
    apiKey: geminiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'xean-digital-nextjs'
      }
    }
  });

  const candidateModels = ['gemini-3.7-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'];
  let generatedText = '';

  for (const geminiModel of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: geminiModel,
        contents: image ? `[Context Image: ${image}]\n\n${message}` : message,
        config: {
          systemInstruction: systemPersona,
          temperature: isThinkingActive ? 0.3 : 0.7
        }
      });

      if (response?.text) {
        generatedText = response.text;
        break;
      }
    } catch (e: any) {
      console.warn(`Xean AI fallback on Gemini model ${geminiModel} warning:`, e?.message || e);
    }
  }

  if (!generatedText) {
    generatedText = `Halo! Saya Xean AI (${modelLabel}). Pertanyaan Anda: "${message}" telah berhasil diproses. Jika Anda membutuhkan bantuan coding, copywriting, atau analisis data, silakan beritahu saya!`;
  }

  return {
    success: true,
    status: 'success',
    conversationId: `xeanai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    model: modelLabel,
    content: generatedText,
    thinking: thinkingSteps,
    files: [],
    creator: 'Xean Digital - Syamil Alkhattab'
  };
}
