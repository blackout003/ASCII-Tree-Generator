// Données structurées pour le serveur (pas de 'use client')

export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ASCII Tree Generator",
    "description": "Générateur d'arbre ASCII gratuit et intuitif pour créer des structures de projet visuelles",
    "url": "https://asciitree.fr",
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
    "inLanguage": ["fr", "en", "es", "de", "it"],
    "featureList": [
      "Génération d'arbres ASCII",
      "Interface drag & drop",
      "Export en format texte",
      "Support multilingue",
      "Thème sombre/clair",
      "Prévisualisation en temps réel"
    ],
    "screenshot": "https://asciitree.fr/og-image.png",
    "softwareVersion": "1.0.0",
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
        "item": "https://asciitree.fr/"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Générateur d'Arbre ASCII",
        "item": "https://asciitree.fr/fr"
      }
    ]
  };
}
