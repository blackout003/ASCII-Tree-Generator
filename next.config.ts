import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  // Optimisations SEO et performance
  poweredByHeader: false, // Supprime le header X-Powered-By
  compress: true, // Compression gzip
  generateEtags: true, // Génération d'ETags pour le cache

  // Autorise l'accès aux ressources de dev (HMR) depuis le réseau local
  allowedDevOrigins: ['192.168.1.9'],

  // Fixe la racine du projet pour éviter que Turbopack ne remonte vers un
  // lockfile parent (ex. ~/package-lock.json) et se trompe de dossier racine.
  turbopack: {
    root: __dirname,
  },

  // Configuration des images
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours
  },
  
  // Redirige www vers l'hôte canonique (sans www) pour éviter le contenu
  // dupliqué : les deux hôtes pointent vers ce déploiement et répondaient tous
  // deux en 200. Le canonical/hreflang utilisant `asciitree.fr`, cette
  // redirection 308 rend l'URL canonique auto-référentielle (fix SEO Lighthouse).
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.asciitree.fr' }],
        destination: 'https://asciitree.fr/:path*',
        permanent: true,
      },
    ];
  },

  // Configuration des headers HTTP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/xml',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, s-maxage=86400',
          },
        ],
      },
    ];
  },
  
  // Optimisations de build
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Configuration TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withNextIntl(nextConfig);
