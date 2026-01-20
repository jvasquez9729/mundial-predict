/** @type {import('next').Config} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Deshabilitar el overlay de desarrollo de Next.js
  devIndicators: {
    buildActivity: false,
  },
  reactStrictMode: true,
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production'
    const securityHeaders = [
      // Prevenir clickjacking
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      // Prevenir MIME type sniffing
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      // Activar protección XSS del navegador
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      // Política de referrer
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      // Permisos del navegador
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=()',
      },
    ]

    // Headers de seguridad HTTPS solo en producción
    if (isProduction) {
      securityHeaders.push(
        // Forzar HTTPS con HSTS (HTTP Strict Transport Security)
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
        // Content Security Policy mejorada
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://vercel.com",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https: blob:",
            "font-src 'self' data:",
            "connect-src 'self' https://*.supabase.co https://api.vercel.com https://*.resend.com https://api.the-odds-api.com",
            "frame-src 'self' https://vercel.live",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests",
          ].join('; '),
        }
      )
    }

    return [
      // Headers de seguridad para todas las rutas
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Headers CORS para APIs
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
        ],
      },
    ]
  },
}

export default nextConfig
