import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { HAIDAR_API_BASE, getActiveHaidarKey, sanitizeData } from '@/lib/xean-config';
import { generateAiAssistantResponse } from '@/lib/ai-assistant';

// Ported from server.ts's `app.post('/api/ai-chat', ...)`. The three-tier
// fallback cascade (named-model shortcut -> Gemini direct -> upstream
// /ai/aiseek -> canned reply) is preserved. The only substantive change is
// the same one as lib/ai-assistant.ts: the "if model looks like Claude"
// branch is now "if model looks like a named Xean AI tier" (xean-ai/pro/
// advanced/fast/opus), since the underlying generateClaudeResponse() this
// called was renamed and de-branded for the reasons documented there.
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { prompt, model = 'xean-ai-pro', thinking = false } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt tidak boleh kosong' }, { status: 400 });
    }

    // If a specific named Xean AI tier is selected (or the default)
    const lowerModel = String(model).toLowerCase();
    const isNamedTier =
      lowerModel.includes('xean-ai') ||
      lowerModel.includes('pro') ||
      lowerModel.includes('advanced') ||
      lowerModel.includes('sonnet') ||
      lowerModel.includes('fast') ||
      lowerModel.includes('haiku') ||
      lowerModel.includes('opus') ||
      lowerModel.includes('lite');

    if (isNamedTier) {
      try {
        const aiData = await generateAiAssistantResponse({
          message: prompt,
          model,
          thinking: thinking === true || thinking === 'true'
        });

        return NextResponse.json({
          success: true,
          reply: aiData.content,
          model: aiData.model,
          thinking: aiData.thinking,
          conversationId: aiData.conversationId,
          creator: 'Xean Digital - Syamil Alkhattab'
        });
      } catch (aiErr: any) {
        console.warn('Named-tier Xean AI generation failed, falling back to standard Gemini cascade:', aiErr);
      }
    }

    // Try Gemini API if key exists with automatic model cascade
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const candidateModels = ['gemini-3.7-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'];
      const systemInstruction = `Kamu adalah Xean AI Assistant, asisten kecerdasan buatan resmi dari Xean Digital (platform penyedia segala kebutuhan digital dan all media downloader nomor 1 di Indonesia).
Owner & Founder: Syamil Alkhattab (Ahli Informatika dan Tech Innovator).
Jawablah dengan ramah, profesional, cerdas, informatif, dan solutif dalam bahasa Indonesia yang keren dan mudah dipahami.
Bantu pengguna dalam membuat caption viral medsos, script konten, rekomendasi prompt AI, troubleshooting teknologi, tips download media kualitas HD, dan coding digital.`;

      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: {
          headers: { 'User-Agent': 'xean-digital-nextjs' }
        }
      });

      for (const modelName of candidateModels) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: { systemInstruction, temperature: 0.7 }
          });

          if (response?.text) {
            return NextResponse.json({
              success: true,
              reply: response.text,
              model: modelName,
              creator: 'Xean Digital - Syamil Alkhattab'
            });
          }
        } catch (modelErr: any) {
          console.warn(`Gemini generation on model ${modelName} encountered: ${modelErr?.message || modelErr}. Trying next candidate...`);
        }
      }
    }

    // Fallback AI via Xean service
    try {
      // NOTE: the original froze this key at module-load time into a
      // `HAIDAR_API_KEY`/`UPSTREAM_API_KEY` constant; calling
      // getActiveHaidarKey() live here is equivalent when no rotation has
      // happened yet and more correct if it has.
      const upstreamUrl = `${HAIDAR_API_BASE}/api/v1/ai/aiseek?prompt=${encodeURIComponent(prompt)}&apikey=${getActiveHaidarKey()}`;
      const fallbackRes = await fetch(upstreamUrl);
      const fallbackData = await fallbackRes.json().catch(() => null);

      if (fallbackData && (fallbackData.result || fallbackData.reply || fallbackData.response)) {
        return NextResponse.json({
          success: true,
          reply: sanitizeData(fallbackData.result || fallbackData.reply || fallbackData.response),
          creator: 'Xean Digital - Syamil Alkhattab'
        });
      }
    } catch (upstreamErr) {
      console.warn('Upstream AI fallback unavailable:', upstreamErr);
    }

    return NextResponse.json({
      success: true,
      reply: `Halo! Saya Xean AI Assistant dari Xean Digital (di-idei oleh Syamil Alkhattab). Menanggapi pertanyaan Anda mengenai "${prompt}": Platform kami siap membantu Anda mengunduh media dari TikTok, Instagram, YouTube, Spotify, serta menyediakan 334+ utilitas digital canggih. Silakan coba menu tools di atas!`,
      creator: 'Xean Digital - Syamil Alkhattab'
    });
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json({
      success: true,
      reply: 'Xean AI Assistant sedang memproses permintaan dengan beban tinggi. Silakan ulangi beberapa saat lagi atau jelajahi berbagai fitur downloader kami.',
      creator: 'Xean Digital - Syamil Alkhattab'
    });
  }
}
