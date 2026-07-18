// Données structurées pour le serveur (pas de 'use client')
import { APP_VERSION } from '@/lib/changelog';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://asciitree.fr';
const IN_LANGUAGE = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ru', 'ja'];

export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ASCII Tree Generator",
    "description": "Générateur d'arbre ASCII gratuit et intuitif pour créer des structures de projet visuelles",
    "url": BASE_URL,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "author": {
      "@type": "Organization",
      "name": "ASCII Tree Generator Team"
    },
    "creator": {
      "@type": "Organization",
      "name": "ASCII Tree Generator"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ASCII Tree Generator"
    },
    "inLanguage": IN_LANGUAGE,
    "featureList": [
      "Génération d'arbres ASCII",
      "Interface drag & drop",
      "Export en format texte",
      "Support multilingue",
      "Thème sombre/clair",
      "Prévisualisation en temps réel"
    ],
    "screenshot": `${BASE_URL}/og-image.png`,
    "softwareVersion": APP_VERSION,
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0]
  };
}

export function generateBreadcrumbStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": `${BASE_URL}/`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Générateur d'Arbre ASCII",
        "item": `${BASE_URL}/fr`
      }
    ]
  };
}
