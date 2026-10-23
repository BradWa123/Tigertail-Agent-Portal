// Security headers on every response.
// connect-src must list the backend API (NEXT_PUBLIC_API_URL); fonts come from Google Fonts.
// 'unsafe-inline' is needed for Next.js's inline bootstrap scripts and the inline styles used
// throughout the app. 'unsafe-eval' is NOT needed in production builds.
// The API is only reachable through Cloudflare (the railway.app origin is locked).
const API_ORIGINS = 'https://api.tigertaillogistics.com'

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob:",
  `connect-src 'self' ${API_ORIGINS}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ')

const securityHeaders = [
  { key: 'Content-Security-Policy',    value: csp },
  { key: 'Strict-Transport-Security',  value: 'max-age=31536000; includeSubDomains' },
  { key: 'X-Frame-Options',            value: 'DENY' },
  { key: 'X-Content-Type-Options',     value: 'nosniff' },
  { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false, // don't advertise the framework
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}

export default nextConfig
