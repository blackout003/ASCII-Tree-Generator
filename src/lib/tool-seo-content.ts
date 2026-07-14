// Indexable SEO copy + FAQ for each tool page. Authored in `en` (required, used as
// fallback) and `fr`. The FAQ array also powers the FAQPage JSON-LD.
// TODO(seo): add es/de/it/pt/ru/ja prose for full localization of the visible copy.
import type { ToolSlug } from '@/lib/seo-config';

export type FaqItem = { q: string; a: string };
export type ToolContent = { heading: string; intro: string; faq: FaqItem[] };
type LocalizedToolContent = { en: ToolContent } & Partial<Record<string, ToolContent>>;

const CONTENT: Record<ToolSlug, LocalizedToolContent> = {
  'ascii-tree': {
    en: {
      heading: 'About the ASCII Tree Generator',
      intro:
        'This free ASCII tree generator turns a folder structure into a clean text diagram you can paste straight into a README.md, a GitHub issue, or technical documentation. Build the tree by drag-and-drop, switch between Unicode (├──) and plain ASCII (|--) connectors, and copy the result in one click — no installation, no signup.',
      faq: [
        {
          q: 'How do I make a file tree for a GitHub README?',
          a: 'Build your folder structure in the editor, open the ASCII preview, and copy the output. Paste it inside a fenced code block (```) in your README.md so the box-drawing characters line up correctly on GitHub.',
        },
        {
          q: "What's the difference between Unicode and ASCII connectors?",
          a: 'Unicode connectors (├──, │, └──) look cleaner and render in most modern editors and on GitHub. Plain ASCII connectors (|--, |, \\--) use only basic characters, which is safer for older terminals, emails, or environments that do not display Unicode reliably.',
        },
        {
          q: 'Will the tree display correctly on GitHub?',
          a: 'Yes. Wrap the tree in a fenced code block so GitHub uses a monospace font — that keeps the branches aligned. Unicode connectors render natively on GitHub.',
        },
        {
          q: 'Is the ASCII tree generator free?',
          a: 'Yes, it is completely free, runs entirely in your browser, and requires no account. Nothing you build is uploaded to a server.',
        },
      ],
    },
    fr: {
      heading: "À propos du générateur d'arbre ASCII",
      intro:
        "Ce générateur d'arbre ASCII gratuit transforme une structure de dossiers en un diagramme texte propre à coller directement dans un README.md, une issue GitHub ou une documentation technique. Construisez l'arborescence en glisser-déposer, basculez entre connecteurs Unicode (├──) et ASCII simple (|--), et copiez le résultat en un clic — sans installation ni inscription.",
      faq: [
        {
          q: 'Comment créer une arborescence de fichiers pour un README GitHub ?',
          a: "Construisez votre structure dans l'éditeur, ouvrez l'aperçu ASCII et copiez le résultat. Collez-le dans un bloc de code (```) de votre README.md pour que les caractères d'encadrement restent alignés sur GitHub.",
        },
        {
          q: 'Quelle différence entre les connecteurs Unicode et ASCII ?',
          a: "Les connecteurs Unicode (├──, │, └──) sont plus nets et s'affichent dans la plupart des éditeurs modernes et sur GitHub. Les connecteurs ASCII simple (|--, |, \\--) n'utilisent que des caractères de base, plus sûrs pour les vieux terminaux, les e-mails ou les environnements sans support Unicode fiable.",
        },
        {
          q: "L'arbre s'affichera-t-il correctement sur GitHub ?",
          a: 'Oui. Placez l\'arbre dans un bloc de code pour que GitHub utilise une police à chasse fixe, ce qui garde les branches alignées. Les connecteurs Unicode s\'affichent nativement sur GitHub.',
        },
        {
          q: 'Le générateur d\'arbre ASCII est-il gratuit ?',
          a: "Oui, il est entièrement gratuit, fonctionne dans votre navigateur et ne nécessite aucun compte. Rien de ce que vous créez n'est envoyé sur un serveur.",
        },
      ],
    },
  },
  'ascii-table': {
    en: {
      heading: 'About the ASCII Table Generator',
      intro:
        'Turn rows and columns into a clean plain-text table for Markdown files, source-code comments, CLI output, or documentation. Pick a border style, set alignment, and copy a table that lines up perfectly in any monospace context.',
      faq: [
        {
          q: 'How do I add an ASCII table to Markdown?',
          a: 'Generate the table, copy it, and paste it inside a fenced code block (```) so the columns stay aligned. For a native Markdown table that renders as HTML, use pipe syntax instead — this tool is ideal for fixed-width, code-comment, and terminal use.',
        },
        {
          q: 'Can I choose different border styles?',
          a: 'Yes. You can switch between border styles such as single lines, double lines and rounded corners, and set column alignment to left, center or right.',
        },
        {
          q: 'Does it work in code comments?',
          a: 'Absolutely — plain-text ASCII tables are perfect for documenting data inside source-code comments, where Markdown rendering is not available.',
        },
      ],
    },
    fr: {
      heading: 'À propos du générateur de tableau ASCII',
      intro:
        "Transformez des lignes et colonnes en un tableau texte propre pour vos fichiers Markdown, commentaires de code, sorties CLI ou documentation. Choisissez un style de bordure, réglez l'alignement et copiez un tableau parfaitement aligné dans tout contexte à chasse fixe.",
      faq: [
        {
          q: 'Comment ajouter un tableau ASCII dans du Markdown ?',
          a: 'Générez le tableau, copiez-le et collez-le dans un bloc de code (```) pour que les colonnes restent alignées. Pour un tableau Markdown natif rendu en HTML, utilisez la syntaxe à barres verticales — cet outil est idéal pour un usage à largeur fixe, en commentaires de code et en terminal.',
        },
        {
          q: 'Puis-je choisir différents styles de bordure ?',
          a: "Oui. Vous pouvez basculer entre des styles comme lignes simples, lignes doubles et coins arrondis, et régler l'alignement des colonnes à gauche, au centre ou à droite.",
        },
        {
          q: 'Est-ce que ça marche dans les commentaires de code ?',
          a: 'Tout à fait — les tableaux ASCII en texte brut sont parfaits pour documenter des données dans les commentaires de code, où le rendu Markdown n\'est pas disponible.',
        },
      ],
    },
  },
  'banner': {
    en: {
      heading: 'About the ASCII Banner Generator',
      intro:
        'Turn any text into a large ASCII-art banner using FIGlet-style fonts. Great for CLI splash screens, README headers, terminal login messages, and code-comment section dividers. Choose a font, type your text, and copy the result.',
      faq: [
        {
          q: 'What is FIGlet?',
          a: 'FIGlet is a classic program that renders text as large letters made up of smaller ASCII characters. This tool generates the same style of text banners directly in your browser.',
        },
        {
          q: 'Where can I use ASCII banners?',
          a: 'They are popular for CLI tool headers, README titles, MOTD/login messages on servers, and as visual dividers inside source code.',
        },
        {
          q: 'Can I change the font?',
          a: 'Yes, you can pick from several FIGlet-style fonts and layouts, then preview and copy the banner instantly.',
        },
      ],
    },
    fr: {
      heading: 'À propos du générateur de bannière ASCII',
      intro:
        "Transformez n'importe quel texte en une grande bannière ASCII avec des polices façon FIGlet. Idéal pour les écrans d'accueil CLI, les en-têtes de README, les messages de connexion en terminal et les séparateurs de sections dans le code. Choisissez une police, saisissez votre texte et copiez le résultat.",
      faq: [
        {
          q: "Qu'est-ce que FIGlet ?",
          a: 'FIGlet est un programme classique qui affiche du texte sous forme de grandes lettres composées de petits caractères ASCII. Cet outil génère le même style de bannières directement dans votre navigateur.',
        },
        {
          q: 'Où utiliser des bannières ASCII ?',
          a: "Elles sont prisées pour les en-têtes d'outils CLI, les titres de README, les messages de connexion (MOTD) sur les serveurs et comme séparateurs visuels dans le code source.",
        },
        {
          q: 'Puis-je changer la police ?',
          a: 'Oui, vous pouvez choisir parmi plusieurs polices et dispositions façon FIGlet, puis prévisualiser et copier la bannière instantanément.',
        },
      ],
    },
  },
  'sparkline': {
    en: {
      heading: 'About the ASCII Sparkline Generator',
      intro:
        'Turn a list of numbers into a compact inline sparkline made of text characters (▁▂▃▄▅▆▇█). Perfect for showing trends in READMEs, dashboards, commit messages, and terminal output where a full chart would be overkill.',
      faq: [
        {
          q: 'What is a sparkline?',
          a: 'A sparkline is a tiny, word-sized chart that shows the shape of a data series without axes or labels. ASCII sparklines use block characters so they work in plain text anywhere.',
        },
        {
          q: 'How do I use it?',
          a: 'Paste or type your numbers separated by spaces or commas, and the tool renders a sparkline you can copy into any text.',
        },
        {
          q: 'Where do ASCII sparklines work?',
          a: 'Anywhere monospace text is supported — READMEs, CLI output, commit messages, chat, and dashboards.',
        },
      ],
    },
    fr: {
      heading: 'À propos du générateur de sparkline ASCII',
      intro:
        'Transformez une liste de nombres en un sparkline compact composé de caractères texte (▁▂▃▄▅▆▇█). Parfait pour montrer des tendances dans les README, tableaux de bord, messages de commit et sorties terminal où un vrai graphique serait excessif.',
      faq: [
        {
          q: "Qu'est-ce qu'un sparkline ?",
          a: "Un sparkline est un mini-graphique de la taille d'un mot qui montre la forme d'une série de données sans axes ni étiquettes. Les sparklines ASCII utilisent des caractères de bloc pour fonctionner en texte brut partout.",
        },
        {
          q: 'Comment l\'utiliser ?',
          a: 'Collez ou saisissez vos nombres séparés par des espaces ou des virgules, et l\'outil génère un sparkline à copier dans n\'importe quel texte.',
        },
        {
          q: 'Où fonctionnent les sparklines ASCII ?',
          a: 'Partout où le texte à chasse fixe est pris en charge — README, sorties CLI, messages de commit, chats et tableaux de bord.',
        },
      ],
    },
  },
  'ascii-emoji': {
    en: {
      heading: 'About the ASCII Emoji & Kaomoji Generator',
      intro:
        'Browse and copy hundreds of ASCII emoji and kaomoji — Japanese-style text faces like ¯\\_(ツ)_/¯ and (╯°□°)╯︵ ┻━┻. Built entirely from text characters, they work in chats, commit messages, code comments, and social posts where image emoji do not.',
      faq: [
        {
          q: 'What is a kaomoji?',
          a: 'A kaomoji is a Japanese emoticon made from text characters that can be read without tilting your head, such as (＾▽＾). Unlike Western emoticons, they are read upright.',
        },
        {
          q: 'How do I use them?',
          a: 'Click any face to copy it to your clipboard, then paste it wherever you need — chat, code, README, or social media.',
        },
        {
          q: 'Do they work everywhere?',
          a: 'Because they are plain text, kaomoji and ASCII emoji work in almost any text field, including places that do not support image-based emoji.',
        },
      ],
    },
    fr: {
      heading: "À propos du générateur d'émoji ASCII & kaomoji",
      intro:
        "Parcourez et copiez des centaines d'émojis ASCII et kaomoji — des émoticônes japonaises comme ¯\\_(ツ)_/¯ et (╯°□°)╯︵ ┻━┻. Entièrement composés de caractères texte, ils fonctionnent dans les chats, messages de commit, commentaires de code et publications sociales, là où les émojis images ne passent pas.",
      faq: [
        {
          q: "Qu'est-ce qu'un kaomoji ?",
          a: 'Un kaomoji est une émoticône japonaise composée de caractères texte qui se lit sans pencher la tête, comme (＾▽＾). Contrairement aux émoticônes occidentales, il se lit à l\'endroit.',
        },
        {
          q: 'Comment les utiliser ?',
          a: 'Cliquez sur un visage pour le copier dans le presse-papiers, puis collez-le où vous voulez — chat, code, README ou réseaux sociaux.',
        },
        {
          q: 'Fonctionnent-ils partout ?',
          a: 'Comme ils sont en texte brut, les kaomoji et émojis ASCII fonctionnent dans presque tous les champs de texte, y compris là où les émojis images ne sont pas pris en charge.',
        },
      ],
    },
  },
  'markdown-guide': {
    en: {
      heading: 'About this Markdown Guide',
      intro:
        'A clear, example-driven Markdown cheat sheet covering the syntax you use every day: headings, bold and italic, lists, links, images, tables, code blocks, blockquotes, and more. Each example shows the Markdown source next to its rendered output.',
      faq: [
        {
          q: 'What is Markdown?',
          a: 'Markdown is a lightweight markup language that lets you format plain text — headings, lists, links, emphasis — using simple, readable symbols. It is widely used for READMEs, documentation, and notes.',
        },
        {
          q: 'How do I write a code block in Markdown?',
          a: 'Wrap code in triple backticks (```) on their own lines, optionally adding a language name after the opening fence for syntax highlighting.',
        },
        {
          q: 'Does Markdown work the same everywhere?',
          a: 'Core syntax is consistent, but flavors differ. GitHub Flavored Markdown adds tables, task lists, and strikethrough on top of standard Markdown.',
        },
      ],
    },
    fr: {
      heading: 'À propos de ce guide Markdown',
      intro:
        "Une antisèche Markdown claire et illustrée couvrant la syntaxe du quotidien : titres, gras et italique, listes, liens, images, tableaux, blocs de code, citations et plus. Chaque exemple montre la source Markdown à côté de son rendu.",
      faq: [
        {
          q: "Qu'est-ce que le Markdown ?",
          a: 'Le Markdown est un langage de balisage léger qui permet de mettre en forme du texte brut — titres, listes, liens, emphase — avec des symboles simples et lisibles. Il est très utilisé pour les README, la documentation et les notes.',
        },
        {
          q: 'Comment écrire un bloc de code en Markdown ?',
          a: 'Encadrez le code par trois accents graves (```) sur leurs propres lignes, en ajoutant éventuellement un nom de langage après la clôture d\'ouverture pour la coloration syntaxique.',
        },
        {
          q: 'Le Markdown fonctionne-t-il pareil partout ?',
          a: 'La syntaxe de base est cohérente, mais les variantes diffèrent. Le GitHub Flavored Markdown ajoute tableaux, listes de tâches et texte barré au Markdown standard.',
        },
      ],
    },
  },
};

export function getToolContent(tool: ToolSlug, locale: string): ToolContent {
  const entry = CONTENT[tool];
  return (entry as Record<string, ToolContent | undefined>)[locale] ?? entry.en;
}
