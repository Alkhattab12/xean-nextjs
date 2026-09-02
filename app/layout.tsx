import type { Metadata, Viewport } from 'next';
import {
  Instrument_Serif,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Outfit
} from 'next/font/google';
import './globals.css';

// Ported 1:1 from the original index.html <link> Google Fonts request
// (family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800
// &family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@400;500;600;700;800;900).
// next/font self-hosts these at build time (no runtime request to Google Fonts,
// no layout shift) instead of the original render-blocking <link> tag.
const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap'
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap'
});

// NOTE: loaded to match the original app's font request 1:1, but neither
// JetBrains Mono nor Outfit is actually wired into any Tailwind class or CSS
// rule in the source (there is no tailwind @theme override and no font-[...]
// arbitrary class using them) — .font-mono falls back to Tailwind's default
// monospace stack either way. They're kept here only for parity; safe to
// delete both if you want a smaller font payload.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap'
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'Xean Digital - All Media Downloader & Digital Hub',
  description:
    'Platform All-in-One Media Downloader & Digital Tools Hub oleh Xean Digital. Unduh video TikTok, Instagram, YouTube, Facebook, Spotify, Terabox, serta puluhan utilitas digital modern.',
  openGraph: {
    title: 'Xean Digital - All Media Downloader & Digital Hub',
    description:
      'Platform All-in-One Media Downloader & Digital Tools Hub oleh Xean Digital. Unduh video TikTok, Instagram, YouTube, Facebook, Spotify, Terabox, serta puluhan utilitas digital modern.',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image'
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Required for env(safe-area-inset-*) to return real values instead of 0
  // on notch/gesture-bar devices — without this, the safe-area padding
  // added in globals.css and the header/bottom-nav below is a no-op.
  viewportFit: 'cover'
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="id"
      className={`dark ${instrumentSerif.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${outfit.variable}`}
    >
      <body className="bg-[#050505] text-[#E0E0E0] font-sans antialiased selection:bg-[#4F46E5]/40 selection:text-white min-h-screen">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
