'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Home, FolderTree } from '@/components/icons';

/**
 * ASCII mascot for the 404 page: a little "tree-bot" that fell off the tree.
 * The art is drawn twice, perfectly overlaid — the base has open eyes, the
 * top copy has closed eyes and fades in briefly (`animate-eye-blink`) so the
 * robot appears to blink. Everything is monospace so the box-drawing lines up.
 */
const MASCOT_OPEN = String.raw`        ╷
   ┌────┴────┐
   │  ●   ●  │
   │    ‿    │
   └──┬───┬──┘
   ┌──┴───┴──┐
   │  ?   ?  │
   └──┬───┬──┘
      ╵   ╵`;

const MASCOT_BLINK = String.raw`        ╷
   ┌────┴────┐
   │  ─   ─  │
   │    ‿    │
   └──┬───┬──┘
   ┌──┴───┴──┐
   │  ?   ?  │
   └──┬───┬──┘
      ╵   ╵`;

export function NotFoundContent() {
  const t = useTranslations('notFound');
  const locale = useLocale();

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      {/* Mascot inside a terminal-style card */}
      <div className="animate-float">
        <div className="relative select-none font-mono leading-tight text-primary">
          <pre
            aria-hidden="true"
            className="text-[13px] sm:text-base"
          >
            {MASCOT_OPEN}
          </pre>
          <pre
            aria-hidden="true"
            className="animate-eye-blink absolute inset-0 text-[13px] opacity-0 sm:text-base"
          >
            {MASCOT_BLINK}
          </pre>
        </div>
      </div>

      {/* 404 headline */}
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">
          {t('code')}
        </p>
        <h1 className="bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-8xl">
          404
        </h1>
        <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
          {t('title')}
        </h2>
        <p className="mx-auto max-w-md text-sm text-muted-foreground sm:text-base">
          {t('description')}
        </p>
      </div>

      {/* Terminal path line — on-theme with the ASCII tools */}
      <code className="rounded-md border border-border bg-muted/60 px-3 py-1.5 font-mono text-xs text-muted-foreground sm:text-sm">
        <span className="text-primary/70">$</span> cat {t('branch')}
        <span className="ml-1 inline-block animate-blink text-primary">▊</span>
      </code>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href={`/${locale}`}>
            <Home />
            {t('home')}
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href={`/${locale}/tools/ascii-tree`}>
            <FolderTree />
            {t('tools')}
          </Link>
        </Button>
      </div>
    </div>
  );
}
