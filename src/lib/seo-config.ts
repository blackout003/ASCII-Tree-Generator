export const SEO_CONFIG = {
  siteName: 'ASCII Tree Generator',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://ascii-tree-generator.emilieng.fr',
  defaultLocale: 'fr',
  supportedLocales: ['fr', 'en', 'es', 'de', 'it'],
  
  titles: {
    fr: "Générateur d'Arbre ASCII - Créez des structures de projet visuelles",
    en: "ASCII Tree Generator - Create visual project structures",
    es: "Generador de Árbol ASCII - Crea estructuras de proyecto visuales",
    de: "ASCII-Baum-Generator - Erstelle visuelle Projektstrukturen",
    it: "Generatore di Albero ASCII - Crea strutture di progetto visive"
  },
  
  descriptions: {
    fr: "Générateur d'arbre ASCII gratuit et intuitif. Visualisez et créez la structure parfaite de votre projet. Convertissez facilement en format ASCII pour votre documentation, README et diagrammes.",
    en: "Free and intuitive ASCII tree generator. Visualize and create the perfect structure for your project. Easily convert to ASCII format for your documentation, README and diagrams.",
    es: "Generador de árbol ASCII gratuito e intuitivo. Visualiza y crea la estructura perfecta para tu proyecto. Convierte fácilmente a formato ASCII para tu documentación, README y diagramas.",
    de: "Kostenloser und intuitiver ASCII-Baum-Generator. Visualisieren und erstellen Sie die perfekte Struktur für Ihr Projekt. Einfach in ASCII-Format für Ihre Dokumentation, README und Diagramme konvertieren.",
    it: "Generatore di albero ASCII gratuito e intuitivo. Visualizza e crea la struttura perfetta per il tuo progetto. Converti facilmente in formato ASCII per la tua documentazione, README e diagrammi."
  },
  
  keywords: [
    "générateur arbre ascii",
    "structure projet",
    "diagramme ascii",
    "documentation technique",
    "readme generator",
    "tree structure",
    "ascii art",
    "project visualization",
    "code documentation",
    "folder structure",
    "développeur",
    "outil gratuit",
    "visualisation projet"
  ],
  
  social: {
    twitter: {
      handle: '@asciitreegen',
      site: '@asciitreegen'
    },
    facebook: {
      appId: 'your-facebook-app-id'
    }
  },
  
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
    bing: 'your-bing-verification-code'
  }
};

export function getLocaleMetadata(locale: string) {
  return {
    title: SEO_CONFIG.titles[locale as keyof typeof SEO_CONFIG.titles] || SEO_CONFIG.titles.fr,
    description: SEO_CONFIG.descriptions[locale as keyof typeof SEO_CONFIG.descriptions] || SEO_CONFIG.descriptions.fr,
    locale: locale,
    alternateLocales: SEO_CONFIG.supportedLocales.filter(l => l !== locale)
  };
}
