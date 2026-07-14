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

// Per-tool SEO metadata, localized for all 8 supported locales.
// `en` is required and used as a safety fallback for any missing locale.
type LocalizedText = { en: string } & Partial<Record<string, string>>;
type ToolMeta = { titles: LocalizedText; descriptions: LocalizedText };

export const TOOLS_SEO = {
  'ascii-tree': {
    titles: {
      fr: "Générateur d'Arbre ASCII — Arborescence pour README | Gratuit",
      en: "ASCII Tree Generator — Folder Structure for README | Free",
      es: "Generador de Árbol ASCII — Estructura de Carpetas para README | Gratis",
      de: "ASCII-Baum-Generator — Ordnerstruktur für README | Kostenlos",
      it: "Generatore di Albero ASCII — Struttura Cartelle per README | Gratis",
      pt: "Gerador de Árvore ASCII — Estrutura de Pastas para README | Grátis",
      ru: "Генератор ASCII-дерева — структура папок для README | Бесплатно",
      ja: "ASCIIツリー生成 — README用フォルダ構成ツール｜無料",
    },
    descriptions: {
      fr: "Créez des arborescences de dossiers ASCII propres pour vos README et docs. Éditeur glisser-déposer, connecteurs Unicode ou ASCII, copie en un clic. Gratuit, sans inscription.",
      en: "Create clean ASCII folder & directory trees for your README and docs. Drag-and-drop editor, Unicode or ASCII connectors, one-click copy. Free, no signup.",
      es: "Crea árboles de carpetas y directorios ASCII limpios para tu README y documentación. Editor de arrastrar y soltar, conectores Unicode o ASCII, copia con un clic. Gratis.",
      de: "Erstellen Sie saubere ASCII-Ordner- und Verzeichnisbäume für README und Doku. Drag-and-drop-Editor, Unicode- oder ASCII-Verbinder, Kopie per Klick. Kostenlos.",
      it: "Crea alberi di cartelle e directory ASCII puliti per README e documentazione. Editor drag-and-drop, connettori Unicode o ASCII, copia con un clic. Gratis.",
      pt: "Crie árvores de pastas e diretórios ASCII limpas para o seu README e docs. Editor de arrastar e soltar, conectores Unicode ou ASCII, cópia com um clique. Grátis.",
      ru: "Создавайте аккуратные ASCII-деревья папок и каталогов для README и документации. Редактор drag-and-drop, коннекторы Unicode или ASCII, копирование в один клик. Бесплатно.",
      ja: "READMEやドキュメント向けの整ったASCIIフォルダ・ディレクトリツリーを作成。ドラッグ＆ドロップ編集、Unicode／ASCIIコネクタ、ワンクリックコピー。無料。",
    },
  },
  'ascii-table': {
    titles: {
      fr: "Générateur de Tableau ASCII — Tableaux Texte Markdown | Gratuit",
      en: "ASCII Table Generator — Plain-Text Tables for Markdown | Free",
      es: "Generador de Tablas ASCII — Tablas de Texto para Markdown | Gratis",
      de: "ASCII-Tabellen-Generator — Textbasierte Tabellen für Markdown | Kostenlos",
      it: "Generatore di Tabelle ASCII — Tabelle di Testo per Markdown | Gratis",
      pt: "Gerador de Tabelas ASCII — Tabelas de Texto para Markdown | Grátis",
      ru: "Генератор ASCII-таблиц — текстовые таблицы для Markdown | Бесплатно",
      ja: "ASCIIテーブル生成 — Markdown用プレーンテキスト表｜無料",
    },
    descriptions: {
      fr: "Générez des tableaux ASCII en texte brut pour markdown, commentaires de code et docs. Styles de bordure, alignement, copie instantanée. Gratuit, dans le navigateur.",
      en: "Generate clean ASCII / plain-text tables for markdown, code comments and docs. Multiple border styles, alignment, instant copy. Free and browser-based.",
      es: "Genera tablas ASCII / de texto plano limpias para markdown, comentarios de código y docs. Varios estilos de borde, alineación, copia instantánea. Gratis, en el navegador.",
      de: "Erzeugen Sie saubere ASCII-/Texttabellen für Markdown, Codekommentare und Doku. Mehrere Rahmenstile, Ausrichtung, sofortiges Kopieren. Kostenlos, im Browser.",
      it: "Genera tabelle ASCII / testo semplice pulite per markdown, commenti di codice e docs. Vari stili di bordo, allineamento, copia istantanea. Gratis, nel browser.",
      pt: "Gere tabelas ASCII / texto simples limpas para markdown, comentários de código e docs. Vários estilos de borda, alinhamento, cópia instantânea. Grátis, no navegador.",
      ru: "Создавайте аккуратные ASCII-таблицы для Markdown, комментариев в коде и документации. Разные стили рамок, выравнивание, мгновенное копирование. Бесплатно, в браузере.",
      ja: "Markdownやコードコメント、ドキュメント向けの整ったASCII／プレーンテキスト表を生成。複数の枠線スタイル、揃え、即コピー。ブラウザで無料。",
    },
  },
  'banner': {
    titles: {
      fr: "Générateur de Bannière ASCII — Art Texte FIGlet | En ligne",
      en: "ASCII Banner Generator — FIGlet Text Art Maker | Free Online",
      es: "Generador de Banners ASCII — Arte de Texto FIGlet | Online Gratis",
      de: "ASCII-Banner-Generator — FIGlet-Textkunst | Kostenlos Online",
      it: "Generatore di Banner ASCII — Arte Testuale FIGlet | Online Gratis",
      pt: "Gerador de Banners ASCII — Arte de Texto FIGlet | Online Grátis",
      ru: "Генератор ASCII-баннеров — текстовый арт в стиле FIGlet | Онлайн бесплатно",
      ja: "ASCIIバナー生成 — FIGlet風テキストアート作成｜無料オンライン",
    },
    descriptions: {
      fr: "Transformez du texte en bannières ASCII avec des polices façon FIGlet. Idéal pour en-têtes CLI, README et commentaires de code. Choisissez, tapez, copiez. Gratuit.",
      en: "Turn text into ASCII art banners with FIGlet-style fonts. Perfect for CLI headers, READMEs and code comments. Pick a font, type, copy. Free and online.",
      es: "Convierte texto en banners de arte ASCII con fuentes estilo FIGlet. Ideal para encabezados CLI, README y comentarios de código. Elige, escribe, copia. Gratis y online.",
      de: "Verwandeln Sie Text in ASCII-Art-Banner mit FIGlet-Schriften. Ideal für CLI-Header, READMEs und Codekommentare. Schrift wählen, tippen, kopieren. Kostenlos & online.",
      it: "Trasforma il testo in banner ASCII con font in stile FIGlet. Perfetto per intestazioni CLI, README e commenti di codice. Scegli, scrivi, copia. Gratis e online.",
      pt: "Transforme texto em banners de arte ASCII com fontes estilo FIGlet. Ideal para cabeçalhos CLI, READMEs e comentários de código. Escolha, digite, copie. Grátis e online.",
      ru: "Превращайте текст в ASCII-баннеры со шрифтами в стиле FIGlet. Идеально для заголовков CLI, README и комментариев в коде. Выберите шрифт, введите, скопируйте. Бесплатно онлайн.",
      ja: "FIGlet風フォントでテキストをASCIIアートバナーに変換。CLIヘッダーやREADME、コードコメントに最適。フォントを選んで入力しコピー。無料オンライン。",
    },
  },
  'sparkline': {
    titles: {
      fr: "Générateur de Sparkline ASCII — Graphiques Texte | En ligne",
      en: "ASCII Sparkline Generator — Inline Text Charts | Free Online",
      es: "Generador de Sparklines ASCII — Gráficos de Texto en Línea | Online Gratis",
      de: "ASCII-Sparkline-Generator — Inline-Textdiagramme | Kostenlos Online",
      it: "Generatore di Sparkline ASCII — Grafici di Testo Inline | Online Gratis",
      pt: "Gerador de Sparklines ASCII — Gráficos de Texto Inline | Online Grátis",
      ru: "Генератор ASCII-спарклайнов — текстовые мини-графики | Онлайн бесплатно",
      ja: "ASCIIスパークライン生成 — インラインのテキストグラフ｜無料オンライン",
    },
    descriptions: {
      fr: "Créez des mini-graphiques sparkline à partir de vos chiffres avec des caractères texte. Parfait pour README, tableaux de bord et commits. Collez vos données, copiez. Gratuit.",
      en: "Create inline sparkline charts from your numbers using text characters. Great for READMEs, dashboards and commit messages. Paste data and copy. Free.",
      es: "Crea minigráficos sparkline a partir de tus números con caracteres de texto. Perfecto para README, paneles y mensajes de commit. Pega datos y copia. Gratis.",
      de: "Erstellen Sie Inline-Sparklines aus Ihren Zahlen mit Textzeichen. Ideal für READMEs, Dashboards und Commit-Nachrichten. Daten einfügen und kopieren. Kostenlos.",
      it: "Crea mini-grafici sparkline dai tuoi numeri usando caratteri di testo. Perfetti per README, dashboard e messaggi di commit. Incolla i dati e copia. Gratis.",
      pt: "Crie minigráficos sparkline a partir dos seus números usando caracteres de texto. Ótimo para READMEs, painéis e mensagens de commit. Cole os dados e copie. Grátis.",
      ru: "Создавайте текстовые спарклайны из ваших чисел с помощью символов. Отлично для README, дашбордов и сообщений коммитов. Вставьте данные и скопируйте. Бесплатно.",
      ja: "数値からテキスト文字でインラインのスパークライングラフを作成。README、ダッシュボード、コミットメッセージに最適。データを貼り付けてコピー。無料。",
    },
  },
  'ascii-emoji': {
    titles: {
      fr: "Générateur d'Émoji ASCII & Kaomoji — Émoticônes Texte | Gratuit",
      en: "ASCII Emoji & Kaomoji Generator — Text Faces | Free Online",
      es: "Generador de Emojis ASCII y Kaomoji — Caritas de Texto | Online Gratis",
      de: "ASCII-Emoji- & Kaomoji-Generator — Text-Smileys | Kostenlos Online",
      it: "Generatore di Emoji ASCII e Kaomoji — Faccine di Testo | Online Gratis",
      pt: "Gerador de Emojis ASCII e Kaomoji — Carinhas de Texto | Online Grátis",
      ru: "Генератор ASCII-эмодзи и каомодзи — текстовые смайлы | Онлайн бесплатно",
      ja: "ASCII絵文字・顔文字ジェネレーター — テキスト顔文字｜無料オンライン",
    },
    descriptions: {
      fr: "Parcourez et copiez des émojis ASCII et kaomoji (émoticônes japonaises) pour vos chats, votre code et vos réseaux. Copie en un clic, des centaines de visages. Gratuit.",
      en: "Browse and copy ASCII emoji and kaomoji (Japanese text faces) for chats, code and social posts. One-click copy, hundreds of faces. Free and online.",
      es: "Explora y copia emojis ASCII y kaomoji (caritas japonesas) para chats, código y redes sociales. Copia con un clic, cientos de caritas. Gratis y online.",
      de: "Durchsuchen und kopieren Sie ASCII-Emojis und Kaomoji (japanische Text-Smileys) für Chats, Code und Social Media. Kopie per Klick, Hunderte Smileys. Kostenlos & online.",
      it: "Sfoglia e copia emoji ASCII e kaomoji (faccine giapponesi) per chat, codice e social. Copia con un clic, centinaia di faccine. Gratis e online.",
      pt: "Navegue e copie emojis ASCII e kaomoji (carinhas japonesas) para chats, código e redes sociais. Cópia com um clique, centenas de carinhas. Grátis e online.",
      ru: "Просматривайте и копируйте ASCII-эмодзи и каомодзи (японские текстовые смайлы) для чатов, кода и соцсетей. Копирование в один клик, сотни смайлов. Бесплатно онлайн.",
      ja: "チャットやコード、SNS向けのASCII絵文字・顔文字（日本語のテキスト顔文字）を探してコピー。ワンクリックコピー、数百種類。無料オンライン。",
    },
  },
  'markdown-guide': {
    titles: {
      fr: "Guide Markdown & Antisèche — Syntaxe avec Exemples | Gratuit",
      en: "Markdown Guide & Cheat Sheet — Syntax with Examples | Free",
      es: "Guía y Chuleta de Markdown — Sintaxis con Ejemplos | Gratis",
      de: "Markdown-Anleitung & Spickzettel — Syntax mit Beispielen | Kostenlos",
      it: "Guida e Cheat Sheet Markdown — Sintassi con Esempi | Gratis",
      pt: "Guia e Folha de Consulta de Markdown — Sintaxe com Exemplos | Grátis",
      ru: "Руководство и шпаргалка по Markdown — синтаксис с примерами | Бесплатно",
      ja: "Markdownガイド＆チートシート — 例で学ぶ記法｜無料",
    },
    descriptions: {
      fr: "Apprenez la syntaxe Markdown avec une antisèche claire et illustrée : titres, listes, tableaux, code, liens et plus. Rendu affiché en parallèle. Gratuit.",
      en: "Learn Markdown syntax with a clear, example-driven cheat sheet: headings, lists, tables, code, links and more. See the rendered output side by side. Free.",
      es: "Aprende la sintaxis de Markdown con una chuleta clara y con ejemplos: encabezados, listas, tablas, código, enlaces y más. Ve el resultado en paralelo. Gratis.",
      de: "Lernen Sie die Markdown-Syntax mit einem klaren, beispielbasierten Spickzettel: Überschriften, Listen, Tabellen, Code, Links und mehr. Ergebnis direkt daneben. Kostenlos.",
      it: "Impara la sintassi Markdown con un cheat sheet chiaro e ricco di esempi: titoli, elenchi, tabelle, codice, link e altro. Vedi il risultato affiancato. Gratis.",
      pt: "Aprenda a sintaxe Markdown com uma folha de consulta clara e cheia de exemplos: títulos, listas, tabelas, código, links e mais. Veja o resultado lado a lado. Grátis.",
      ru: "Изучите синтаксис Markdown с наглядной шпаргалкой с примерами: заголовки, списки, таблицы, код, ссылки и другое. Результат отображается рядом. Бесплатно.",
      ja: "見出し・リスト・表・コード・リンクなど、例が豊富な分かりやすいチートシートでMarkdown記法を習得。レンダリング結果を横並びで確認。無料。",
    },
  },
} satisfies Record<string, ToolMeta>;

export type ToolSlug = keyof typeof TOOLS_SEO;

export function getToolMetadata(tool: ToolSlug, locale: string) {
  const entry = TOOLS_SEO[tool];
  const titles = entry.titles as Record<string, string | undefined>;
  const descriptions = entry.descriptions as Record<string, string | undefined>;
  return {
    title: titles[locale] ?? entry.titles.en,
    description: descriptions[locale] ?? entry.descriptions.en,
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
