import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ASCII Tree Generator',
    short_name: 'ASCII Tree',
    description: 'Générateur d\'arbre ASCII gratuit et intuitif pour créer des structures de projet visuelles',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/Logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/Logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    categories: ['productivity', 'utilities', 'developer-tools'],
    lang: 'fr',
    dir: 'ltr',
    orientation: 'portrait-primary',
    scope: '/',
    prefer_related_applications: false,
  }
}
