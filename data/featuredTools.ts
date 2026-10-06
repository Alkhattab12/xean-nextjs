export interface FeaturedTool {
  id: string;
  name: string;
  category: 'downloader' | 'ai' | 'search' | 'maker' | 'tools' | 'spotify' | 'converter';
  categoryLabel: string;
  description: string;
  endpointPath: string;
  method: 'GET' | 'POST';
  icon: string;
  badge?: string;
  popular?: boolean;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'number';
    placeholder?: string;
    defaultValue?: any;
    options?: { label: string; value: any }[];
    required?: boolean;
  }[];
}

export const FEATURED_TOOLS: FeaturedTool[] = [
  // Downloader
  {
    id: 'tiktok-dl',
    name: 'TikTok Video HD No-Watermark',
    category: 'downloader',
    categoryLabel: 'Downloader',
    description: 'Download video TikTok tanpa watermark dengan kualitas HD 1080p beserta audio MP3.',
    endpointPath: '/api/v1/downloader/tiktok-dl',
    method: 'POST',
    icon: 'Video',
    popular: true,
    badge: 'Popular',
    fields: [
      { name: 'url', label: 'Link URL TikTok', type: 'text', placeholder: 'https://vt.tiktok.com/ZS... atau https://www.tiktok.com/@...', required: true }
    ]
  },
  {
    id: 'instagram-dl',
    name: 'Instagram Reels & Post HD',
    category: 'downloader',
    categoryLabel: 'Downloader',
    description: 'Unduh video Reels, Post, Carousel Foto, dan Story Instagram dengan kualitas original.',
    endpointPath: '/api/v1/downloader/instagram',
    method: 'GET',
    icon: 'Instagram',
    popular: true,
    badge: 'Fast',
    fields: [
      { name: 'url', label: 'Link Post / Reels Instagram', type: 'text', placeholder: 'https://www.instagram.com/reel/... atau /p/...', required: true }
    ]
  },
  {
    id: 'youtube-dl',
    name: 'YouTube Video & Audio MP3',
    category: 'downloader',
    categoryLabel: 'Downloader',
    description: 'Unduh video YouTube resolusi tinggi (1080p, 720p, 480p) atau konversi langsung ke audio MP3.',
    endpointPath: '/api/v1/downloader/youtubedl',
    method: 'GET',
    icon: 'Youtube',
    popular: true,
    fields: [
      { name: 'url', label: 'Link YouTube Video / Shorts', type: 'text', placeholder: 'https://www.youtube.com/watch?v=... atau https://youtu.be/...', required: true }
    ]
  },
  {
    id: 'spotify-dl',
    name: 'Spotify Track Downloader',
    category: 'spotify',
    categoryLabel: 'Spotify Hub',
    description: 'Download lagu Spotify kualitas audio 320kbps lengkap dengan cover art dan info album.',
    endpointPath: '/api/v1/downloader/spotify',
    method: 'GET',
    icon: 'Music',
    popular: true,
    badge: '320kbps',
    fields: [
      { name: 'url', label: 'Link Lagu Spotify', type: 'text', placeholder: 'https://open.spotify.com/track/...', required: true }
    ]
  },
  {
    id: 'terabox-dl',
    name: 'TeraBox Anti Limit Downloader',
    category: 'downloader',
    categoryLabel: 'Downloader',
    description: 'Unduh file dari TeraBox tanpa perlu login aplikasi dan bypass limit kecepatan.',
    endpointPath: '/api/v1/downloader/terabox',
    method: 'GET',
    icon: 'HardDrive',
    popular: true,
    fields: [
      { name: 'url', label: 'Link TeraBox Share', type: 'text', placeholder: 'https://terabox.com/s/... atau https://1024tera.com/s/...', required: true }
    ]
  },
  {
    id: 'facebook-dl',
    name: 'Facebook Video Downloader',
    category: 'downloader',
    categoryLabel: 'Downloader',
    description: 'Unduh video Facebook publik dalam kualitas HD dan SD.',
    endpointPath: '/api/v1/downloader/facebook',
    method: 'GET',
    icon: 'Facebook',
    fields: [
      { name: 'url', label: 'Link Video Facebook', type: 'text', placeholder: 'https://www.facebook.com/.../videos/...', required: true }
    ]
  },
  {
    id: 'twitter-dl',
    name: 'Twitter / X Video Downloader',
    category: 'downloader',
    categoryLabel: 'Downloader',
    description: 'Unduh video atau GIF dari cuitan Twitter / X langsung ke format MP4.',
    endpointPath: '/api/v1/downloader/x',
    method: 'GET',
    icon: 'Twitter',
    fields: [
      { name: 'url', label: 'Link Cuitan Twitter/X', type: 'text', placeholder: 'https://x.com/.../status/...', required: true }
    ]
  },
  {
    id: 'douyin-dl',
    name: 'Douyin Video Downloader HD',
    category: 'downloader',
    categoryLabel: 'Downloader',
    description: 'Unduh video dari Douyin kualitas HD tanpa watermark.',
    endpointPath: '/api/v1/downloader/douyin',
    method: 'GET',
    icon: 'Scissors',
    fields: [
      { name: 'url', label: 'Link Video Douyin', type: 'text', placeholder: 'https://v.douyin.com/...', required: true }
    ]
  },
  {
    id: 'bilibili-dl',
    name: 'Bilibili / Bstation HD Video',
    category: 'downloader',
    categoryLabel: 'Downloader',
    description: 'Unduh video dari Bilibili atau Bstation dengan resolusi hingga 1080p.',
    endpointPath: '/api/v1/downloader/bilibili',
    method: 'GET',
    icon: 'Film',
    fields: [
      { name: 'url', label: 'Link Video Bilibili (BV ID / URL)', type: 'text', placeholder: 'https://www.bilibili.com/video/BV...', required: true }
    ]
  },
  {
    id: 'mega-dl',
    name: 'MEGA.nz Direct Downloader',
    category: 'downloader',
    categoryLabel: 'Downloader',
    description: 'Dapatkan link download direct dari file cloud MEGA.nz.',
    endpointPath: '/api/v1/downloader/mega',
    method: 'GET',
    icon: 'Cloud',
    fields: [
      { name: 'url', label: 'Link MEGA.nz', type: 'text', placeholder: 'https://mega.nz/file/...', required: true }
    ]
  },
  {
    id: 'github-dl',
    name: 'GitHub Repo Downloader',
    category: 'downloader',
    categoryLabel: 'Downloader',
    description: 'Download source code repository GitHub dalam format ZIP secara instan.',
    endpointPath: '/api/v1/downloader/github',
    method: 'GET',
    icon: 'Github',
    fields: [
      { name: 'url', label: 'URL GitHub Repo', type: 'text', placeholder: 'https://github.com/username/repository', required: true }
    ]
  },

  // AI & Generative
  {
    id: 'xean-ai-chat',
    name: 'Xean AI Pro & Advanced Multi-Model AI',
    category: 'ai',
    categoryLabel: 'AI Studio',
    description: 'Chat Xean AI dengan pilihan model komplit: Xean AI Pro, Advanced, Fast, Lite, dan Opus serta Thinking Mode.',
    endpointPath: '/api/v1/ai/xean',
    method: 'GET',
    icon: 'Bot',
    popular: true,
    badge: 'Xean AI Pro',
    fields: [
      { name: 'message', label: 'Pesan / Pertanyaan / Perintah', type: 'textarea', placeholder: 'Jelaskan cara implementasi autentikasi JWT di Express TypeScript beserta best practices keamanannya...', required: true },
      { 
        name: 'model', 
        label: 'Pilihan Model Xean AI', 
        type: 'select', 
        defaultValue: 'xean-ai-pro',
        options: [
          { label: '🟣 Xean AI Pro (Hybrid Reasoning & Coding)', value: 'xean-ai-pro' },
          { label: '🔵 Xean AI Advanced (Advanced Coding & Analysis)', value: 'xean-ai-advanced' },
          { label: '⚡ Xean AI Fast (Ultra Fast & Concise)', value: 'xean-ai-fast' },
          { label: '🏛️ Xean AI Opus (Deep Analysis & Research)', value: 'xean-ai-opus' },
          { label: '⚡ Xean AI Lite (Lightweight Fast)', value: 'xean-ai-lite' }
        ], 
        required: true 
      },
      {
        name: 'thinking',
        label: 'Thinking Mode (Deep Chain-of-Thought)',
        type: 'select',
        defaultValue: 'false',
        options: [
          { label: 'Nonaktif (Respon Standar Cepat)', value: 'false' },
          { label: 'Aktif (Deep Thinking Trace)', value: 'true' }
        ]
      }
    ]
  },
  {
    id: 'flux-image',
    name: 'Flux AI Image Generator',
    category: 'ai',
    categoryLabel: 'AI Studio',
    description: 'Hasilkan gambar realistis & artistik kualitas tinggi dari deskripsi teks (Prompt).',
    endpointPath: '/api/v1/ai-image/fluximg',
    method: 'GET',
    icon: 'Sparkles',
    popular: true,
    badge: 'AI Gen',
    fields: [
      { name: 'prompt', label: 'Deskripsi Prompt Visual', type: 'textarea', placeholder: 'Cyberpunk neon city at night with flying cars, ultra realistic 8k, cinematic lighting...', required: true }
    ]
  },
  {
    id: 'ai-code',
    name: 'AI Code Assistant & Debugger',
    category: 'ai',
    categoryLabel: 'AI Studio',
    description: 'Buat kode pemrograman, perbaiki bug, atau buat arsitektur script dalam berbagai bahasa.',
    endpointPath: '/api/v1/ai/ai-code',
    method: 'GET',
    icon: 'Code',
    popular: true,
    fields: [
      { name: 'prompt', label: 'Instruksi / Permintaan Kode', type: 'textarea', placeholder: 'Buat fungsi React TypeScript untuk upload gambar dengan drag and drop dan preview...', required: true }
    ]
  },
  {
    id: 'aiseek',
    name: 'Xean AI Intelligent Search & Answer',
    category: 'ai',
    categoryLabel: 'AI Studio',
    description: 'Tanya apa saja ke model AI cerdas untuk riset, penulisan artikel, dan analisis data.',
    endpointPath: '/api/v1/ai/aiseek',
    method: 'GET',
    icon: 'Bot',
    fields: [
      { name: 'prompt', label: 'Pertanyaan atau Topik Riset', type: 'textarea', placeholder: 'Jelaskan cara kerja arsitektur microservices vs monolithic dengan kelebihan dan kekurangannya...', required: true }
    ]
  },

  // Search & Stalker
  {
    id: 'stalker-instagram',
    name: 'Instagram Profile Stalker',
    category: 'search',
    categoryLabel: 'Stalker & Search',
    description: 'Cek profil publik Instagram: foto profil HD, bio, jumlah followers/following, dan postingan.',
    endpointPath: '/api/v1/stalker/instagram',
    method: 'GET',
    icon: 'UserCheck',
    popular: true,
    fields: [
      { name: 'username', label: 'Username Instagram (tanpa @)', type: 'text', placeholder: 'syamil_alkhattab', required: true }
    ]
  },
  {
    id: 'stalker-tiktok',
    name: 'TikTok User Stalker',
    category: 'search',
    categoryLabel: 'Stalker & Search',
    description: 'Analisis akun TikTok: jumlah likes, video, bio, avatar HD, dan status verifikasi.',
    endpointPath: '/api/v1/stalker/tiktok',
    method: 'GET',
    icon: 'Search',
    fields: [
      { name: 'username', label: 'Username TikTok', type: 'text', placeholder: 'xeandigital', required: true }
    ]
  },
  {
    id: 'search-pinterest',
    name: 'Pinterest Image Search',
    category: 'search',
    categoryLabel: 'Stalker & Search',
    description: 'Cari ide visual, wallpaper, dan foto estetis langsung dari database Pinterest.',
    endpointPath: '/api/v1/search/pinterest-photo',
    method: 'GET',
    icon: 'Image',
    fields: [
      { name: 'query', label: 'Kata Kunci Pencarian', type: 'text', placeholder: 'aesthetic minimalist desktop wallpaper dark', required: true }
    ]
  },

  // Spotify Hub
  {
    id: 'spotify-lyrics',
    name: 'Spotify Lyrics Finder',
    category: 'spotify',
    categoryLabel: 'Spotify Hub',
    description: 'Dapatkan lirik sinkronisasi resmi lagu favoritmu di Spotify.',
    endpointPath: '/api/v1/spotify/lyrics',
    method: 'GET',
    icon: 'FileText',
    fields: [
      { name: 'url', label: 'Link Lagu Spotify', type: 'text', placeholder: 'https://open.spotify.com/track/...', required: true }
    ]
  },
  {
    id: 'spotify-search',
    name: 'Spotify Music Search',
    category: 'spotify',
    categoryLabel: 'Spotify Hub',
    description: 'Cari lagu, artis, dan album di katalog global Spotify.',
    endpointPath: '/api/v1/spotify/search',
    method: 'GET',
    icon: 'Disc',
    fields: [
      { name: 'query', label: 'Judul Lagu / Nama Artis', type: 'text', placeholder: 'Coldplay Yellow', required: true }
    ]
  },

  // Graphic Maker & TextPro
  {
    id: 'textpro-glitch',
    name: 'Glitch Cyber Text Effect',
    category: 'maker',
    categoryLabel: 'Graphic Maker',
    description: 'Buat banner teks dengan efek glitch visual 3D cyberpunk futuristik.',
    endpointPath: '/api/v1/textpro/glitch',
    method: 'GET',
    icon: 'Zap',
    badge: '3D FX',
    fields: [
      { name: 'text', label: 'Teks Efek Glitch', type: 'text', placeholder: 'XEAN DIGITAL', required: true }
    ]
  },
  {
    id: 'textpro-avengers',
    name: 'Avengers 3D Metal Text Maker',
    category: 'maker',
    categoryLabel: 'Graphic Maker',
    description: 'Buat tipografi 3D metallic ala Marvel Avengers dengan 2 baris teks kustom.',
    endpointPath: '/api/v1/textpro/avengers',
    method: 'GET',
    icon: 'Layers',
    badge: 'Marvel FX',
    fields: [
      { name: 'text1', label: 'Teks Baris Pertama', type: 'text', placeholder: 'XEAN', required: true },
      { name: 'text2', label: 'Teks Baris Kedua', type: 'text', placeholder: 'STUDIO', required: true }
    ]
  },

  // Utilities & Dev
  {
    id: 'tools-bypaslink',
    name: 'Universal Link Bypasser',
    category: 'tools',
    categoryLabel: 'Digital Utilities',
    description: 'Bypass shortlink, safelink, dan monetized link iklan secara instan.',
    endpointPath: '/api/v1/tools/bypaslink',
    method: 'GET',
    icon: 'Link',
    badge: 'Fast',
    fields: [
      { name: 'url', label: 'Link Target / Safelink', type: 'text', placeholder: 'https://ouo.io/... atau https://linkvertise.com/...', required: true }
    ]
  },
  {
    id: 'tools-tempmail',
    name: 'Disposable Temporary Email Generator',
    category: 'tools',
    categoryLabel: 'Digital Utilities',
    description: 'Buat alamat email sementara sekali pakai untuk verifikasi akun instan.',
    endpointPath: '/api/v1/tools/tempmail/create',
    method: 'GET',
    icon: 'Globe',
    fields: []
  },
  {
    id: 'tools-screenshot',
    name: 'Web Fullpage Screenshot',
    category: 'tools',
    categoryLabel: 'Digital Utilities',
    description: 'Ambil tangkapan layar HD dari website apa pun secara otomatis.',
    endpointPath: '/api/v1/tools/screenshot',
    method: 'GET',
    icon: 'QrCode',
    fields: [
      { name: 'url', label: 'URL Website', type: 'text', placeholder: 'https://xeandigital.web.id', required: true }
    ]
  }
];

export const PLATFORMS_LIST = [
  { id: 'all', name: 'Semua Platform', icon: 'Layers', color: 'from-cyan-500 to-blue-600', badge: 'Auto Detect' },
  { id: 'tiktok', name: 'TikTok & Douyin', icon: 'Video', color: 'from-pink-500 to-rose-600', badge: 'No Watermark' },
  { id: 'instagram', name: 'Instagram', icon: 'Instagram', color: 'from-fuchsia-500 to-purple-600', badge: 'Reels & Post' },
  { id: 'youtube', name: 'YouTube', icon: 'Youtube', color: 'from-red-500 to-rose-700', badge: 'MP4 / MP3' },
  { id: 'facebook', name: 'Facebook', icon: 'Facebook', color: 'from-blue-600 to-indigo-700', badge: 'HD Video' },
  { id: 'twitter', name: 'X / Twitter', icon: 'Twitter', color: 'from-slate-700 to-zinc-900', badge: 'Video & GIF' },
  { id: 'spotify', name: 'Spotify', icon: 'Music', color: 'from-emerald-500 to-green-600', badge: '320kbps MP3' },
  { id: 'terabox', name: 'TeraBox', icon: 'HardDrive', color: 'from-sky-500 to-cyan-600', badge: 'Anti Limit' },
  { id: 'pinterest', name: 'Pinterest', icon: 'Image', color: 'from-rose-600 to-red-600', badge: 'Pin & Media' },
  { id: 'capcut', name: 'CapCut', icon: 'Scissors', color: 'from-neutral-800 to-cyan-800', badge: 'No WM' },
  { id: 'bilibili', name: 'Bilibili', icon: 'Film', color: 'from-sky-400 to-blue-500', badge: '1080p HD' },
  { id: 'github', name: 'GitHub', icon: 'Github', color: 'from-zinc-700 to-neutral-900', badge: 'Source Code' },
  { id: 'gdrive', name: 'Google Drive', icon: 'Cloud', color: 'from-amber-500 to-yellow-600', badge: 'Direct Link' },
  { id: 'mega', name: 'MEGA.nz', icon: 'CloudRain', color: 'from-red-600 to-rose-800', badge: 'Cloud File' }
];
