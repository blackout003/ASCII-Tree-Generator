import type { Metadata } from 'next';

export const SEO_CONFIG = {
  siteName: 'ASCII Tree Generator',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://asciitree.fr',
  defaultLocale: 'fr',
  supportedLocales: ['fr', 'en', 'es', 'de', 'it', 'pt', 'ru', 'ja'],

  titles: {
    fr: "Générateur d'Arbre ASCII pour README & Documentation | Gratuit & En ligne",
    en: "ASCII Tree Generator for README & Documentation | Free & Online",
    es: "Generador de Árbol ASCII para README y Documentación | Gratis y Online",
    de: "ASCII-Baum-Generator für README & Dokumentation | Kostenlos & Online",
    it: "Generatore di Albero ASCII per README e Documentazione | Gratuito e Online",
    pt: "Gerador de Árvore ASCII para README e Documentação | Grátis e Online",
    ru: "Генератор ASCII-дерева для README и документации | Бесплатно и онлайн",
    ja: "README・ドキュメント向け ASCIIツリー生成ツール｜無料・オンライン"
  },

  descriptions: {
    fr: "Créez et visualisez facilement l'arborescence de vos projets au format texte (ASCII). Idéal pour vos fichiers README.md et documentations techniques. Export simple, gratuit et sans installation.",
    en: "Easily create and visualize your project structure in text format (ASCII). Perfect for your README.md files and technical documentation. Simple export, free and no installation required.",
    es: "Crea y visualiza fácilmente la estructura de tus proyectos en formato texto (ASCII). Ideal para tus archivos README.md y documentación técnica. Exportación simple, gratuita y sin instalación.",
    de: "Erstellen und visualisieren Sie mühelos Ihre Projektstruktur im Textformat (ASCII). Ideal für Ihre README.md-Dateien und technische Dokumentation. Einfacher Export, kostenlos und ohne Installation.",
    it: "Crea e visualizza facilmente la struttura dei tuoi progetti in formato testo (ASCII). Ideale per i tuoi file README.md e documentazione tecnica. Esportazione semplice, gratuita e senza installazione.",
    pt: "Crie e visualize facilmente a estrutura dos seus projetos em formato de texto (ASCII). Ideal para arquivos README.md e documentação técnica. Exportação simples, grátis e sem instalação.",
    ru: "Легко создавайте и визуализируйте структуру проектов в текстовом формате (ASCII). Идеально для файлов README.md и технической документации. Простой экспорт, бесплатно и без установки.",
    ja: "プロジェクトのフォルダ構成をテキスト形式（ASCII）で簡単に作成・可視化。README.md や技術ドキュメントに最適。ワンクリックでコピー、無料・インストール不要。"
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

// Per-tool SEO metadata. `fr` and `en` are authored in full; every other locale
// falls back to `en` (a correct, non-French fallback) via getToolMetadata().
// TODO(seo): author es/de/it/pt/ru/ja variants for full localization.
type ToolMeta = { titles: { fr: string; en: string }; descriptions: { fr: string; en: string } };

export const TOOLS_SEO = {
  'ascii-tree': {
    titles: {
      fr: "Générateur d'Arbre ASCII — Arborescence pour README | Gratuit",
      en: "ASCII Tree Generator — Folder Structure for README | Free",
    },
    descriptions: {
      fr: "Créez des arborescences de dossiers ASCII propres pour vos README et docs. Éditeur glisser-déposer, connecteurs Unicode ou ASCII, copie en un clic. Gratuit, sans inscription.",
      en: "Create clean ASCII folder & directory trees for your README and docs. Drag-and-drop editor, Unicode or ASCII connectors, one-click copy. Free, no signup.",
    },
  },
  'ascii-table': {
    titles: {
      fr: "Générateur de Tableau ASCII — Tableaux Texte Markdown | Gratuit",
      en: "ASCII Table Generator — Plain-Text Tables for Markdown | Free",
    },
    descriptions: {
      fr: "Générez des tableaux ASCII en texte brut pour markdown, commentaires de code et docs. Styles de bordure, alignement, copie instantanée. Gratuit, dans le navigateur.",
      en: "Generate clean ASCII / plain-text tables for markdown, code comments and docs. Multiple border styles, alignment, instant copy. Free and browser-based.",
    },
  },
  'banner': {
    titles: {
      fr: "Générateur de Bannière ASCII — Art Texte FIGlet | En ligne",
      en: "ASCII Banner Generator — FIGlet Text Art Maker | Free Online",
    },
    descriptions: {
      fr: "Transformez du texte en bannières ASCII avec des polices façon FIGlet. Idéal pour en-têtes CLI, README et commentaires de code. Choisissez, tapez, copiez. Gratuit.",
      en: "Turn text into ASCII art banners with FIGlet-style fonts. Perfect for CLI headers, READMEs and code comments. Pick a font, type, copy. Free and online.",
    },
  },
  'sparkline': {
    titles: {
      fr: "Générateur de Sparkline ASCII — Graphiques Texte | En ligne",
      en: "ASCII Sparkline Generator — Inline Text Charts | Free Online",
    },
    descriptions: {
      fr: "Créez des mini-graphiques sparkline à partir de vos chiffres avec des caractères texte. Parfait pour README, tableaux de bord et commits. Collez vos données, copiez. Gratuit.",
      en: "Create inline sparkline charts from your numbers using text characters. Great for READMEs, dashboards and commit messages. Paste data and copy. Free.",
    },
  },
  'ascii-emoji': {
    titles: {
      fr: "Générateur d'Émoji ASCII & Kaomoji — Émoticônes Texte | Gratuit",
      en: "ASCII Emoji & Kaomoji Generator — Text Faces | Free Online",
    },
    descriptions: {
      fr: "Parcourez et copiez des émojis ASCII et kaomoji (émoticônes japonaises) pour vos chats, votre code et vos réseaux. Copie en un clic, des centaines de visages. Gratuit.",
      en: "Browse and copy ASCII emoji and kaomoji (Japanese text faces) for chats, code and social posts. One-click copy, hundreds of faces. Free and online.",
    },
  },
  'markdown-guide': {
    titles: {
      fr: "Guide Markdown & Antisèche — Syntaxe avec Exemples | Gratuit",
      en: "Markdown Guide & Cheat Sheet — Syntax with Examples | Free",
    },
    descriptions: {
      fr: "Apprenez la syntaxe Markdown avec une antisèche claire et illustrée : titres, listes, tableaux, code, liens et plus. Rendu affiché en parallèle. Gratuit.",
      en: "Learn Markdown syntax with a clear, example-driven cheat sheet: headings, lists, tables, code, links and more. See the rendered output side by side. Free.",
    },
  },
} satisfies Record<string, ToolMeta>;

export type ToolSlug = keyof typeof TOOLS_SEO;

export function getToolMetadata(tool: ToolSlug, locale: string) {
  const entry = TOOLS_SEO[tool];
  const lang = locale === 'fr' ? 'fr' : 'en';
  return {
    title: entry.titles[lang],
    description: entry.descriptions[lang],
    path: `/${locale}/tools/${tool}`,
  };
}

/** Full page Metadata for a tool route. metadataBase is inherited from the locale layout. */
export function buildToolMetadata(tool: ToolSlug, locale: string): Metadata {
  const { title, description, path } = getToolMetadata(tool, locale);
  // A page-level `alternates` replaces (does not merge with) the layout's, so the
  // per-tool hreflang map must be rebuilt here across every locale.
  const languages: Record<string, string> = Object.fromEntries(
    SEO_CONFIG.supportedLocales.map((l) => [l, `/${l}/tools/${tool}`])
  );
  languages['x-default'] = `/${SEO_CONFIG.defaultLocale}/tools/${tool}`;
  return {
    title,
    description,
    alternates: { canonical: path, languages },
    openGraph: {
      title,
      description,
      url: `${SEO_CONFIG.baseUrl}${path}`,
      siteName: SEO_CONFIG.siteName,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: title }],
      locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-image.png'],
      creator: SEO_CONFIG.social.twitter.handle,
      site: SEO_CONFIG.social.twitter.site,
    },
  };
}
