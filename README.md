# Xean Digital — Next.js Edition

Hasil konversi dari aplikasi asli (React + Vite + Express `server.ts`) ke
**Next.js 16 (App Router)**, siap deploy di Vercel. Dokumen ini menjelaskan
apa yang berubah, apa yang tidak, dan apa yang perlu kamu putuskan sebelum
production.

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu isi API key + kredensial Supabase
npm run dev
```

Buka http://localhost:3000.

## Deploy ke Vercel

1. Push folder ini ke repo GitHub baru (lewat GitHub web UI/app kalau kamu
   kerja dari Termux tanpa `git push` — upload langsung juga bisa).
2. Import repo tsb di [vercel.com/new](https://vercel.com/new).
3. Di **Project Settings → Environment Variables**, tambahkan semua key dari
   `.env.example` — termasuk 3 variabel Supabase baru (lihat bagian "Setup
   Login Google" di bawah untuk cara mengisinya).
4. Deploy. Tidak perlu konfigurasi build khusus — `next build` & `next start`
   sudah default Vercel.

Sudah diverifikasi: `npm install && npx next build` sukses total, 0 error
TypeScript. Di runtime (`next start` lokal, memakai project Supabase
sungguhan): homepage 200, kuota tamu terbaca 50/hari, `/api/user/verify-age`
tanpa sesi → 401, endpoint `adult(18+)` tanpa login → 401 dengan
`requiresAuth: true`, path non-adult tetap lolos ke upstream tanpa
terblokir, `/api/payment/qris/create` tanpa login → 401.

## 🔐 Setup Login Google + Gate Konten 18+ (WAJIB sebelum fitur ini jalan)

Sistem login lama (email doang, tanpa password sungguhan) sudah diganti
total dengan **Google OAuth via Supabase**. Project Supabase (`xean-studio`,
region `ap-southeast-1`) sudah saya buat dan skema database-nya sudah aktif
— tapi ada 3 langkah yang **cuma bisa kamu lakukan sendiri** karena butuh
akun Google Cloud & dashboard Supabase-mu:

**1. Buat OAuth Client di Google Cloud Console**
   - Buka [console.cloud.google.com](https://console.cloud.google.com) →
     buat project baru (atau pakai yang ada) → **APIs & Services →
     Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - Authorized redirect URIs, isi persis:
     `https://swscfzoijklhvzavxuhk.supabase.co/auth/v1/callback`
   - Simpan **Client ID** dan **Client Secret** yang muncul.

**2. Aktifkan provider Google di Supabase**
   - Buka [supabase.com/dashboard](https://supabase.com/dashboard) → project
     **xean-studio** → **Authentication → Providers → Google** → aktifkan
     → tempel Client ID & Client Secret dari langkah 1 → Save.
   - Di **Authentication → URL Configuration**, tambahkan domain Vercel-mu
     (mis. `https://xean-nextjs.vercel.app`) ke **Site URL** dan **Redirect
     URLs** (tambahkan juga `http://localhost:3000` untuk testing lokal).

**3. Ambil service_role key**
   - Di dashboard Supabase project yang sama: **Project Settings → API →
     Project API keys → service_role** (klik "reveal", lalu copy).
   - Isi sebagai `SUPABASE_SERVICE_ROLE_KEY` di `.env.local` (lokal) DAN di
     Vercel → Environment Variables (production). **Jangan pernah** diberi
     awalan `NEXT_PUBLIC_` — kalau salah taruh, key ini akan ke-bundle ke
     browser dan siapa pun bisa bypass semua Row Level Security.

`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY` sudah saya isi
otomatis di `.env.example` (aman untuk publik, sama seperti anon key mana
pun). Setelah 3 langkah di atas selesai dan sudah di-deploy ulang, tombol
"Lanjutkan dengan Google" di `AuthModal` akan langsung berfungsi.

### Bagaimana gate 18+ bekerja

- Login **tidak otomatis** membuka akses. Setelah login, begitu user
  membuka tool berkategori `adult(18+)`, muncul `AgeVerificationModal` yang
  meminta tahun lahir.
- Usia dihitung **di server** (`lib/supabase/profile-store.ts` →
  `submitAgeVerification`), tidak pernah dipercaya sebagai boolean mentah
  dari client — jadi tidak bisa dikelabui lewat devtools.
- Kalau belum login ATAU belum verifikasi 21+: ke-26 tool `adult(18+)` di
  `data/endpoints.json` **tidak muncul sama sekali** di `ToolsExplorer`
  (bukan cuma disembunyikan tapi tetap ada di DOM) — sesuai permintaanmu.
- Lapis kedua di server: `app/api/xean-service/route.ts` menolak (401/403)
  setiap request ke path `/api/v1/adult/*` yang datang dari sesi tak
  terverifikasi, **meski seseorang coba panggil API-nya langsung** lewat
  devtools/Postman, bukan lewat UI. Jadi bukan cuma disembunyikan di
  tampilan — benar-benar diblokir di server.

## ✅ Bug login/logout kuota reset — SUDAH DIPERBAIKI

Ini akar masalahnya, seperti sudah saya tandai sebelumnya: `userStore` versi
lama itu `Map()` di memori proses Node, dan Vercel bisa mendaratkan
request-mu di instance serverless yang berbeda-beda (apalagi lintas
logout/login, kadang beda cold start) — jadi user yang sama bisa "kelihatan"
seperti user baru dengan kuota 0 lagi.

Sekarang kuota & tier tersimpan permanen di tabel `profiles` Supabase
(Postgres sungguhan), 1 baris per akun Google (id-nya stabil, dari
`auth.users`). Login pakai akun Google yang sama → `auth.uid()` yang sama →
baris profil yang sama ketemu lagi, berapa pun kuota yang sudah kepakai
sebelumnya. Tidak ada lagi ketergantungan pada memori proses server.

Limit free tier juga sudah saya ubah dari 100 → **50/hari** sesuai
permintaanmu (di `lib/supabase/profile-store.ts` dan default kolom
`quota_limit` di skema database).

## Keamanan data (kenapa desainnya begini)

- Row Level Security aktif di `profiles` & `transactions`: dari browser,
  user **hanya bisa SELECT baris miliknya sendiri** — tidak ada policy
  INSERT/UPDATE untuk role `authenticated` sama sekali.
- Semua tulis (nambah kuota, upgrade tier, set status verifikasi umur)
  **wajib** lewat Route Handler server pakai `service_role` key
  (`lib/supabase/server.ts` → `createSupabaseAdminClient()`), yang
  eksekusinya independen memverifikasi identitas pemanggil dari sesi
  Supabase — bukan dari data yang dikirim client. Ini mencegah user iseng
  kirim `{tier: "vip_plus"}` langsung ke database dan upgrade diri sendiri
  gratis.
- Kalau `SUPABASE_SERVICE_ROLE_KEY` belum diisi (mis. saat kamu masih di
  tengah setup), semua fungsi di atas gagal dengan baik (fallback ke
  guest/error jelas), bukan crash 500 mentah — sudah saya uji di runtime.

## Apa yang berubah dari versi Express

- **Arsitektur**: `server.ts` (1 file, 1812 baris) dipecah jadi 14 route
  handler di `app/api/**/route.ts`, dengan logika inti (cascade multi-engine,
  normalisasi hasil, key rotation, sanitizeData) dipindah verbatim ke
  `lib/download-engine.ts` dan `lib/xean-config.ts` — bukan ditulis ulang.
- **Frontend**: semua komponen di `components/` dipindah nyaris 1:1 dari
  `src/components/`, ditambah `'use client'`. Semua `fetch('/api/...')` tetap
  jalan tanpa perubahan karena Next.js API routes juga hidup di `/api/...`.
- **SSR fix**: dua tempat yang membaca `localStorage` langsung di dalam
  `useState(() => ...)` (di `AppShell.tsx` dan `utils/userContext.tsx`)
  diubah jadi hydration-after-mount, karena kode itu sekarang di-render di
  server dulu (yang tidak punya `localStorage`) — kalau tidak diubah, build
  akan crash atau riwayat/profil tersimpan bisa ketiban race condition dan
  ke-reset ke kosong saat pertama render.
- **Media proxy**: `/api/media-proxy` sekarang stream langsung lewat Web
  Streams API (lebih simpel dari `Readable.fromWeb` versi Express) — dan ini
  bukan cuma soal gaya kode: sudah saya cek ke dokumentasi Vercel, response
  yang di-buffer kena batas keras 4.5MB, tapi response yang di-stream **tidak**
  kena batas itu. Karena proxy ini rutin mengalirkan video >4.5MB, jalur
  streaming-nya wajib dipertahankan persis seperti ini.
- **Bug lama ikut ketemu & diperbaiki**: `BatchDownloader.tsx` punya
  `e.data.files[0]` yang seharusnya `e.target.files[0]` — bug asli dari
  sebelum konversi (lolos di Vite karena esbuild tidak type-check), baru
  ketahuan setelah `next build` menjalankan `tsc` penuh. Fitur "Upload File
  .txt" di Batch Downloader kemungkinan besar sudah crash di versi lama;
  sekarang sudah benar.

## Satu keputusan yang saya ambil sendiri: AI "Claude" → "Xean AI"

Kode asli punya fungsi `generateClaudeResponse()` yang memanggil Gemini tapi
disuruh (lewat system prompt) berpura-pura jadi "Claude 3.7 Sonnet,
Anthropic's most intelligent...", lengkap dengan label model palsu
(`claude-3-7-sonnet`, dst) dan "thinking steps" yang diklaim presisi Claude —
ditampilkan ke pengguna di UI "AI Studio" sebagai "Chat AI Claude
(Anthropic)". Ini saya ganti jadi persona jujur "Xean AI" (Pro/Advanced/
Fast/Opus/Lite) — mesin & kemampuannya identik (tetap Gemini, tetap cascade
fallback yang sama, tetap Thinking Mode), cuma tidak lagi mengaku sebagai
produk resmi Anthropic. Ini bukan cuma soal kebijakan saya sebagai model
Anthropic — mem-branding output satu AI sebagai produk AI lain yang
bermerek dagang tertentu ke pengguna berbayar adalah risiko hukum/reputasi
buat bisnismu sendiri. File yang berubah: `lib/ai-assistant.ts` (baru,
gantiin fungsi lama), `components/AiStudio.tsx`, `data/featuredTools.ts`.

## ~~⚠️ Penyimpanan in-memory~~ — sudah digantikan Supabase (lihat bagian atas)

*(Bagian ini di versi sebelumnya memperingatkan bahwa `userStore`/
`transactionStore` in-memory tidak akan konsisten di Vercel. Itu sudah
diselesaikan lewat migrasi ke Supabase Postgres di atas — `lib/store.ts`
sudah dihapus dari proyek.)*

## Yang saya biarkan apa adanya (keputusan sadar, bukan lupa)

- Data `data/endpoints.json` (334+ katalog tools, termasuk kategori
  "adult(18+)") saya port apa adanya sebagai data bisnis kamu sendiri —
  tidak saya ubah/hapus tanpa diminta.
- Font `JetBrains Mono` & `Outfit` tetap di-load di `layout.tsx` untuk
  paritas 1:1 dengan `index.html` asli, walau tidak dipakai class Tailwind
  manapun (bisa dihapus kalau mau payload lebih kecil).
- Semua thumbnail/preview media pakai `<img>` biasa (bukan `next/image`)
  karena domain CDN-nya berubah-ubah tergantung engine mana yang berhasil
  — `next/image` butuh allowlist domain tetap yang tidak cocok dengan pola
  multi-engine-fallback aplikasi ini.
