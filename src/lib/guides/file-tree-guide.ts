// Content for the "How to make a file tree for a GitHub README" guide.
// Authored in en (required, fallback) and fr. Code samples are language-neutral.
import type { FaqItem } from '@/lib/tool-seo-content';

export const GUIDE_SLUG = 'file-tree-for-github-readme';

export const CODE = {
  treeUnix: "tree -I 'node_modules|.git|dist'",
  treeWin: 'tree /F /A',
  exampleTree: `my-project
├── src
│   ├── index.ts
│   └── utils.ts
├── tests
│   └── index.test.ts
├── package.json
└── README.md`,
  fencedBlock: '```\nmy-project\n├── src\n│   └── index.ts\n└── README.md\n```',
};

export type GuideSection = { h2: string; body: string[]; code?: { caption?: string; text: string } };
export type Guide = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  lead: string;
  ctaTitle: string;
  ctaBody: string;
  ctaButton: string;
  sections: GuideSection[];
  faqHeading: string;
  faq: FaqItem[];
};

const en: Guide = {
  metaTitle: 'How to Make a File Tree for a GitHub README | Step-by-Step Guide',
  metaDescription:
    'Three easy ways to create a folder-structure file tree for your GitHub README: the tree command, a free online ASCII tree generator, and a VS Code extension — with copy-paste examples.',
  h1: 'How to Make a File Tree for a GitHub README',
  lead:
    "A file tree — the small ASCII diagram of your project's folders and files — makes a README instantly easier to scan. This guide shows three reliable ways to create one, and how to paste it so the branches line up correctly on GitHub.",
  ctaTitle: 'The fastest way: an online ASCII tree generator',
  ctaBody:
    'No command line, no install. Build your folder structure visually, switch between Unicode and plain-ASCII connectors, and copy a clean diagram in one click.',
  ctaButton: 'Open the ASCII Tree Generator',
  sections: [
    {
      h2: 'Method 1 — The tree command',
      body: [
        'Every major operating system ships with (or can install) a tree command that prints a directory structure as text.',
        'On macOS or Linux, install it if needed (brew install tree or sudo apt install tree), then run it in your project folder. Use -I to ignore noisy folders:',
        'On Windows, the command is built in. Run it in the folder you want to document:',
        'Copy the output from your terminal and move on to the "Make it render on GitHub" section below.',
      ],
      code: { caption: 'macOS / Linux', text: CODE.treeUnix },
    },
    {
      h2: 'Method 2 — An online ASCII tree generator',
      body: [
        'If you do not want to touch the command line, or you are documenting a structure that does not exist on disk yet, an online generator is the simplest option.',
        'You add folders and files in a visual editor, rearrange them by drag-and-drop, choose Unicode (├──) or plain-ASCII (|--) connectors, and copy the result. Nothing is uploaded — it all runs in your browser.',
      ],
    },
    {
      h2: 'Method 3 — A VS Code extension',
      body: [
        'Several VS Code extensions (search for "file tree to text") add a right-click "Generate file tree" action on any folder, with Markdown output.',
        'This is handy when you live inside the editor, though you have less control over which folders to exclude than with the tree command or a dedicated generator.',
      ],
    },
    {
      h2: 'Make it render on GitHub',
      body: [
        'However you generate the tree, GitHub will only keep the branches aligned if it uses a monospace font. Wrap the tree in a fenced code block — three backticks on their own line, before and after:',
        'Without the code fences, GitHub renders the text with a proportional font and the │ and ├── characters drift out of alignment.',
      ],
      code: { caption: 'In your README.md', text: CODE.fencedBlock },
    },
    {
      h2: 'Unicode vs ASCII connectors',
      body: [
        'Unicode connectors (├──, │, └──) look cleaner and render natively on GitHub and in modern editors — use them by default.',
        'Plain-ASCII connectors (|--, |, \\--) use only basic characters. Choose them for older terminals, plain-text emails, or environments that do not display Unicode reliably.',
      ],
      code: { caption: 'Example output', text: CODE.exampleTree },
    },
  ],
  faqHeading: 'Frequently asked questions',
  faq: [
    {
      q: 'How do I exclude node_modules from the tree?',
      a: 'With the tree command, pass -I to ignore patterns, e.g. tree -I "node_modules|.git|dist". In an online generator, simply do not add those folders.',
    },
    {
      q: 'Why is my file tree misaligned on GitHub?',
      a: 'It is almost always because the tree is not inside a fenced code block. Wrap it in triple backticks so GitHub uses a monospace font.',
    },
    {
      q: 'Can I create a file tree without installing anything?',
      a: 'Yes — use a free online ASCII tree generator that runs entirely in your browser. You build the structure visually and copy the result.',
    },
  ],
};

const fr: Guide = {
  metaTitle: 'Comment créer une arborescence de fichiers pour un README GitHub | Guide',
  metaDescription:
    "Trois méthodes simples pour créer une arborescence de fichiers dans votre README GitHub : la commande tree, un générateur d'arbre ASCII en ligne gratuit et une extension VS Code — avec des exemples à copier-coller.",
  h1: 'Comment créer une arborescence de fichiers pour un README GitHub',
  lead:
    "Une arborescence de fichiers — le petit diagramme ASCII des dossiers et fichiers de votre projet — rend un README bien plus lisible. Ce guide présente trois méthodes fiables pour en créer une, et comment la coller pour que les branches restent alignées sur GitHub.",
  ctaTitle: "La méthode la plus rapide : un générateur d'arbre ASCII en ligne",
  ctaBody:
    "Sans ligne de commande ni installation. Construisez votre structure de dossiers visuellement, basculez entre connecteurs Unicode et ASCII simple, et copiez un diagramme propre en un clic.",
  ctaButton: "Ouvrir le générateur d'arbre ASCII",
  sections: [
    {
      h2: 'Méthode 1 — La commande tree',
      body: [
        "Tous les principaux systèmes d'exploitation disposent (ou peuvent installer) d'une commande tree qui affiche une structure de dossiers sous forme de texte.",
        'Sur macOS ou Linux, installez-la si besoin (brew install tree ou sudo apt install tree), puis lancez-la dans le dossier de votre projet. Utilisez -I pour ignorer les dossiers superflus :',
        'Sur Windows, la commande est intégrée. Lancez-la dans le dossier à documenter :',
        'Copiez la sortie de votre terminal et passez à la section « Faire en sorte que ça s\'affiche sur GitHub » ci-dessous.',
      ],
      code: { caption: 'macOS / Linux', text: CODE.treeUnix },
    },
    {
      h2: 'Méthode 2 — Un générateur d\'arbre ASCII en ligne',
      body: [
        "Si vous ne voulez pas toucher à la ligne de commande, ou si vous documentez une structure qui n'existe pas encore sur le disque, un générateur en ligne est l'option la plus simple.",
        "Vous ajoutez dossiers et fichiers dans un éditeur visuel, les réorganisez en glisser-déposer, choisissez des connecteurs Unicode (├──) ou ASCII simple (|--), et copiez le résultat. Rien n'est envoyé — tout se passe dans votre navigateur.",
      ],
    },
    {
      h2: 'Méthode 3 — Une extension VS Code',
      body: [
        'Plusieurs extensions VS Code (cherchez « file tree to text ») ajoutent une action « Générer l\'arborescence » au clic droit sur un dossier, avec une sortie Markdown.',
        "Pratique quand vous vivez dans l'éditeur, même si vous contrôlez moins les dossiers à exclure qu'avec la commande tree ou un générateur dédié.",
      ],
    },
    {
      h2: "Faire en sorte que ça s'affiche sur GitHub",
      body: [
        'Quelle que soit la méthode, GitHub ne gardera les branches alignées que s\'il utilise une police à chasse fixe. Encadrez l\'arbre dans un bloc de code — trois accents graves sur leur propre ligne, avant et après :',
        'Sans les accents graves, GitHub affiche le texte avec une police proportionnelle et les caractères │ et ├── se désalignent.',
      ],
      code: { caption: 'Dans votre README.md', text: CODE.fencedBlock },
    },
    {
      h2: 'Connecteurs Unicode vs ASCII',
      body: [
        'Les connecteurs Unicode (├──, │, └──) sont plus nets et s\'affichent nativement sur GitHub et dans les éditeurs modernes — utilisez-les par défaut.',
        'Les connecteurs ASCII simple (|--, |, \\--) n\'utilisent que des caractères de base. Choisissez-les pour les vieux terminaux, les e-mails en texte brut ou les environnements sans support Unicode fiable.',
      ],
      code: { caption: 'Exemple de sortie', text: CODE.exampleTree },
    },
  ],
  faqHeading: 'Questions fréquentes',
  faq: [
    {
      q: 'Comment exclure node_modules de l\'arborescence ?',
      a: 'Avec la commande tree, passez -I pour ignorer des motifs, ex. tree -I "node_modules|.git|dist". Dans un générateur en ligne, il suffit de ne pas ajouter ces dossiers.',
    },
    {
      q: 'Pourquoi mon arborescence est-elle désalignée sur GitHub ?',
      a: "C'est presque toujours parce que l'arbre n'est pas dans un bloc de code. Encadrez-le de trois accents graves pour que GitHub utilise une police à chasse fixe.",
    },
    {
      q: 'Puis-je créer une arborescence sans rien installer ?',
      a: "Oui — utilisez un générateur d'arbre ASCII en ligne gratuit qui fonctionne entièrement dans votre navigateur. Vous construisez la structure visuellement et copiez le résultat.",
    },
  ],
};

const GUIDES: Record<string, Guide> = { en, fr };

export function getFileTreeGuide(locale: string): Guide {
  return GUIDES[locale] ?? GUIDES.en;
}
