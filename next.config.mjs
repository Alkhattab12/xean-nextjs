/** @type {import('next').NextConfig} */
const nextConfig = {
  // Thumbnails/media previews come from whichever third-party CDN the active
  // downloader engine returns (TikTok, Instagram, YouTube, etc.) and the exact
  // host varies per-request/per-engine-fallback, so plain <img> tags are used
  // throughout instead of next/image (which requires a fixed remotePatterns
  // allowlist). This is a deliberate choice, not an oversight — see README.
  //
  // NOTE: no ESLint config here — Next.js 16 moved build-time lint control
  // out of next.config.mjs (an `eslint.ignoreDuringBuilds` key here now
  // errors as an "unrecognized key"). No eslint/eslint-config-next package
  // is installed in this project either, so `next build` doesn't invoke
  // linting at all; `npm run lint` runs `tsc --noEmit` instead (see
  // package.json). Add eslint back yourself if you want it.
};

export default nextConfig;
