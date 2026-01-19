export const SEO_CONFIG = {
  siteName: 'ASCII Tree Generator',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://ascii-tree-generator.emilieng.fr',
  defaultLocale: 'fr',
  supportedLocales: ['fr', 'en', 'es', 'de', 'it'],
  
  titles: {
    fr: "Générateur d'Arbre ASCII pour README & Documentation | Gratuit & En ligne",
    en: "ASCII Tree Generator for README & Documentation | Free & Online",
    es: "Generador de Árbol ASCII para README y Documentación | Gratis y Online",
    de: "ASCII-Baum-Generator für README & Dokumentation | Kostenlos & Online",
    it: "Generatore di Albero ASCII per README e Documentazione | Gratuito e Online"
  },
  
  descriptions: {
    fr: "Créez et visualisez facilement l'arborescence de vos projets au format texte (ASCII). Idéal pour vos fichiers README.md et documentations techniques. Export simple, gratuit et sans installation.",
    en: "Easily create and visualize your project structure in text format (ASCII). Perfect for your README.md files and technical documentation. Simple export, free and no installation required.",
    es: "Crea y visualiza fácilmente la estructura de tus proyectos en formato texto (ASCII). Ideal para tus archivos README.md y documentación técnica. Exportación simple, gratuita y sin instalación.",
    de: "Erstellen und visualisieren Sie mühelos Ihre Projektstruktur im Textformat (ASCII). Ideal für Ihre README.md-Dateien und technische Dokumentation. Einfacher Export, kostenlos und ohne Installation.",
    it: "Crea e visualizza facilmente la struttura dei tuoi progetti in formato testo (ASCII). Ideale per i tuoi file README.md e documentazione tecnica. Esportazione semplice, gratuita e senza installazione."
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
    "visualisation projet",
    "arborescence projet texte",
    "structure dossier readme",
    "générer tree command windows linux en ligne",
    "faire arbre fichiers github",
    "visualiser structure dossier markdown"
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
    // Remplacez par votre vrai code de vérification Google Search Console
    // Format : 'xxxxxxxxxx' (sans guillemets supplémentaires)
    google: 'Us63uejMYf_eRurx-77CguTsgZPywmV4cgOlCB5ekyU',
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
