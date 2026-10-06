import type { Metadata, Viewport } from 'next';
import {
  Bricolage_Grotesque,
  Space_Grotesk,
  Space_Mono
} from 'next/font/google';
import './globals.css';

// Font neobrutalism: Bricolage Grotesque (heading display, tebal & berkarakter),
// Space Grotesk (teks isi), Space Mono (label/angka). Di-host sendiri oleh
// next/font saat build — tidak ada request runtime ke Google Fonts.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-bricolage',
  display: 'swap'
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap'
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
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
  themeColor: '#F1EDFF',
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
      className={`${bricolage.variable} ${spaceGrotesk.variable} ${spaceMono.variable}`}
    >
      <body className="bg-paper text-ink font-sans antialiased min-h-screen">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
