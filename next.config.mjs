import withPWA from 'next-pwa'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // سایر تنظیمات Next.js شما
}

// تنظیمات PWA را مستقیماً به withPWA بدهید، نه داخل آبجکت pwa
export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  buildExcludes: [/app-build-manifest\.json$/],
  // سایر تنظیمات PWA
})(nextConfig) // nextConfig را به عنوان آرگومان پاس بدهید