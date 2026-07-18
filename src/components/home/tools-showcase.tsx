'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';

interface ShowcaseTool {
  id: string;
  href: string;
  tag: string;
  nameKey: string;
  descKey: string;
  preview: string;
}

// "ASCII" rendered as block-letters — the banner tool's own output, used as the masthead.
const MASTHEAD = ` █████╗ ███████╗ ██████╗██╗██╗
██╔══██╗██╔════╝██╔════╝██║██║
███████║███████╗██║     ██║██║
██╔══██║╚════██║██║     ██║██║
██║  ██║███████║╚██████╗██║██║
╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝╚═╝`;

const SHOWCASE_TOOLS: ShowcaseTool[] = [
  {
    id: 'ascii-tree',
    href: '/tools/ascii-tree',
    tag: 'TREE',
    nameKey: 'asciiTree',
    descKey: 'home.tools.asciiTree.desc',
    preview: `project/
├── src/
│   ├── index.ts
│   └── utils.ts
└── README.md`,
  },
  {
    id: 'ascii-table',
    href: '/tools/ascii-table',
    tag: 'TABLE',
    nameKey: 'asciiTable',
    descKey: 'home.tools.asciiTable.desc',
    preview: `┌───────┬───────┐
│ Nom   │ Score │
├───────┼───────┤
│ Alice │  95   │
└───────┴───────┘`,
  },
  {
    id: 'sparkline',
    href: '/tools/sparkline',
    tag: 'CHART',
    nameKey: 'sparkline',
    descKey: 'home.tools.sparkline.desc',
    preview: `Ventes  ▁▂▃▅▇▆▄▂
Trafic  ▂▄▆█▇▅▃▁
CPU     ▃▃▅▂▇▆▄▅`,
  },
  {
    id: 'banner',
    href: '/tools/banner',
    tag: 'BANNER',
    nameKey: 'banner',
    descKey: 'home.tools.banner.desc',
    preview: `██╗  ██╗██╗
██║  ██║██║
███████║██║
██╔══██║██║
██║  ██║██║
╚═╝  ╚═╝╚═╝`,
  },
  {
    id: 'markdown-editor',
    href: '/tools/markdown-editor',
    tag: 'MARKDOWN',
    nameKey: 'markdownEditor',
    descKey: 'home.tools.markdownEditor.desc',
    preview: `# Titre        │  Titre
**gras**       │  gras
- liste        │  • liste
\`code\`         │  code`,
  },
];

// Reference guides — listed apart from the generators above.
const SHOWCASE_RESOURCES: ShowcaseTool[] = [
  {
    id: 'markdown-guide',
    href: '/tools/markdown-guide',
    tag: 'GUIDE',
    nameKey: 'markdownGuide',
    descKey: 'home.tools.markdownGuide.desc',
    preview: `# Titre
**gras**  *italique*
- liste
> citation
\`code\``,
  },
  {
    id: 'ascii-emoji',
    href: '/tools/ascii-emoji',
    tag: 'EMOJI',
    nameKey: 'asciiEmoji',
    descKey: 'home.tools.asciiEmoji.desc',
    preview: `:)  :D  ;)  <3
¯\\_(ツ)_/¯
( ͡° ͜ʖ ͡°)
ʕ•ᴥ•ʔ`,
  },
];

function ShowcaseCard({ tool, index }: { tool: ShowcaseTool; index: number }) {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <Link
      href={`/${locale}${tool.href}`}
      style={{ animationDelay: `${index * 70}ms` }}
      className="group animate-rise-in flex flex-col bg-background p-6 outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
    >
      {/* header row: mono tag + open affordance */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-medium tracking-[0.15em] px-1.5 py-0.5 border border-border text-muted-foreground transition-colors group-hover:border-foreground group-hover:bg-foreground group-hover:text-background">
          {tool.tag}
        </span>
        <span className="font-mono text-xs text-muted-foreground opacity-0 -translate-x-1 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:translate-x-0">
          {t('home.open')} →
        </span>
      </div>

      <h2 className="mt-4 font-mono text-lg font-semibold text-foreground">
        {t(`nav.${tool.nameKey}` as never)}
      </h2>

      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        {t(tool.descKey as never)}
      </p>

      <pre className="mt-5 border border-border bg-muted/40 p-4 text-xs leading-relaxed text-foreground/75 font-mono overflow-x-auto whitespace-pre transition-colors group-hover:border-foreground/20">
        {tool.preview}
      </pre>
    </Link>
  );
}

export function ToolsShowcase() {
  const t = useTranslations();

  return (
    <section className="container mx-auto px-6 max-w-5xl">
      {/* Hero — the masthead is the banner tool's own output */}
      <div className="pt-16 pb-14 sm:pt-20">
        <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-muted-foreground">
          {t('home.heroBadge')}
        </p>

        <h1 className="mt-6">
          <span className="sr-only">{t('home.heroTitle')}</span>
          <span className="flex flex-wrap items-end gap-x-5 gap-y-3">
            <pre
              aria-hidden="true"
              className="font-mono text-foreground leading-none text-[10px] sm:text-sm md:text-base overflow-x-auto"
            >
              {MASTHEAD}
            </pre>
            <span
              aria-hidden="true"
              className="flex items-center gap-2 font-mono text-2xl sm:text-3xl font-bold tracking-[0.35em] text-foreground pb-0.5"
            >
              TOOLS
              <span className="animate-blink inline-block h-6 w-[0.5em] translate-y-0.5 bg-foreground" />
            </span>
          </span>
        </h1>

        <p className="mt-7 max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
          {t('home.heroSubtitle')}
        </p>
      </div>

      {/* Tools — a monospace index grid ruled with hairlines, like a TUI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border">
        {SHOWCASE_TOOLS.map((tool, i) => (
          <ShowcaseCard key={tool.id} tool={tool} index={i} />
        ))}
      </div>

      {/* Resources — reference guides, kept apart from the generators */}
      <div className="mt-16 pb-4">
        <p className="font-mono text-[11px] sm:text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">
          {t('nav.resources')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border border-border">
          {SHOWCASE_RESOURCES.map((resource, i) => (
            <ShowcaseCard key={resource.id} tool={resource} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
