'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { FolderTree, Table, BarChart2, Type, ArrowRight, Sparkles } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ShowcaseTool {
  id: string;
  href: string;
  icon: LucideIcon;
  nameKey: string;
  descKey: string;
  preview: string;
  accent: string;
}

const SHOWCASE_TOOLS: ShowcaseTool[] = [
  {
    id: 'ascii-tree',
    href: '/tools/ascii-tree',
    icon: FolderTree,
    nameKey: 'nav.asciiTree',
    descKey: 'home.tools.asciiTree.desc',
    accent: 'text-blue-500',
    preview: `project/
├── src/
│   ├── index.ts
│   └── utils.ts
└── README.md`,
  },
  {
    id: 'ascii-table',
    href: '/tools/ascii-table',
    icon: Table,
    nameKey: 'nav.asciiTable',
    descKey: 'home.tools.asciiTable.desc',
    accent: 'text-emerald-500',
    preview: `┌──────┬───────┐
│ Nom  │ Score │
├──────┼───────┤
│ Alice│  95   │
└──────┴───────┘`,
  },
  {
    id: 'sparkline',
    href: '/tools/sparkline',
    icon: BarChart2,
    nameKey: 'nav.sparkline',
    descKey: 'home.tools.sparkline.desc',
    accent: 'text-amber-500',
    preview: `Ventes  ▁▂▃▅▇▆▄▂
Trafic  ▂▄▆█▇▅▃▁
CPU     ▃▃▅▂▇▆▄▅`,
  },
  {
    id: 'banner',
    href: '/tools/banner',
    icon: Type,
    nameKey: 'nav.banner',
    descKey: 'home.tools.banner.desc',
    accent: 'text-purple-500',
    preview: ` _   _ ___
| | | |_ _|
| |_| || |
 \\___/|___|`,
  },
];

export function ToolsShowcase() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <section className="container mx-auto px-6 max-w-7xl">
      {/* Hero */}
      <div className="pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <Sparkles className="size-3.5 text-blue-500" />
          <span>{t('home.heroBadge')}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-5">
          {t('home.heroTitle')}
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed">
          {t('home.heroSubtitle')}
        </p>
      </div>

      {/* Tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-4">
        {SHOWCASE_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.id} href={`/${locale}${tool.href}`} className="group block">
              <Card className="h-full overflow-hidden border-border transition-all duration-200 hover:border-foreground/20 hover:shadow-lg">
                <div className="flex flex-col h-full p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`flex size-10 items-center justify-center rounded-lg bg-muted ${tool.accent}`}>
                      <Icon className="size-5" />
                    </span>
                    <h2 className="text-xl font-semibold text-foreground">
                      {t(tool.nameKey as never)}
                    </h2>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    {t(tool.descKey as never)}
                  </p>

                  <pre className="mt-auto rounded-md bg-muted/60 p-4 text-xs leading-relaxed text-foreground/80 font-mono overflow-x-auto whitespace-pre">
                    {tool.preview}
                  </pre>

                  <div className={`mt-5 inline-flex items-center gap-1.5 text-sm font-medium ${tool.accent}`}>
                    <span>{t('home.open')}</span>
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
