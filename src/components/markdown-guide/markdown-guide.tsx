'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MARKDOWN_CATEGORIES } from '@/lib/markdown-guide-data';
import { cn } from '@/lib/utils';

type GuideT = ReturnType<typeof useTranslations>;

function CopyButton({ code }: { code: string }) {
  const t = useTranslations('markdownGuide');
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ description: t('copyError'), variant: 'destructive' });
    }
  }, [code, t, toast]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? t('copied') : t('copy')}
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 font-mono text-[11px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? t('copied') : t('copy')}
    </button>
  );
}

function Example({ code, html }: { code: string; html: string }) {
  const t = useTranslations('markdownGuide');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
      {/* Markdown source */}
      <div className="flex flex-col bg-muted/30">
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            {t('markdown')}
          </span>
          <CopyButton code={code} />
        </div>
        <pre className="flex-1 overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-foreground/85 whitespace-pre">
          {code}
        </pre>
      </div>

      {/* Rendered result */}
      <div className="flex flex-col bg-background">
        <div className="border-b border-border px-3 py-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            {t('result')}
          </span>
        </div>
        <div
          className="mdg-preview prose prose-sm dark:prose-invert max-w-none flex-1 p-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}

function CategorySection({
  id,
  Icon,
  examples,
  t,
}: {
  id: string;
  Icon: React.ComponentType<{ className?: string }>;
  examples: { code: string; html: string }[];
  t: GuideT;
}) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
          <Icon className="size-4 text-foreground" />
        </div>
        <div>
          <h2 className="font-mono text-xl font-semibold text-foreground">
            {t(`categories.${id}.title` as never)}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t(`categories.${id}.desc` as never)}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {examples.map((ex, i) => (
          <Example key={i} code={ex.code} html={ex.html} />
        ))}
      </div>
    </section>
  );
}

export function MarkdownGuide() {
  const t = useTranslations('markdownGuide');
  const [activeId, setActiveId] = useState<string>(MARKDOWN_CATEGORIES[0].id);

  const handleNavClick = useCallback((id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Header */}
      <header className="border-b border-border pb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          {t('badge')}
        </p>
        <h1 className="mt-4 font-mono text-3xl font-bold text-foreground sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          {t('subtitle')}
        </p>
      </header>

      {/* Table of contents — quick jump chips */}
      <nav aria-label={t('tocTitle')} className="sticky top-0 z-10 -mx-6 bg-background/85 px-6 py-3 backdrop-blur">
        <div className="flex flex-wrap gap-1.5">
          {MARKDOWN_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleNavClick(cat.id)}
              className={cn(
                'rounded-full border px-3 py-1 font-mono text-[11px] transition-colors',
                activeId === cat.id
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
              )}
            >
              {t(`categories.${cat.id}.title` as never)}
            </button>
          ))}
        </div>
      </nav>

      {/* Sections */}
      <div className="mt-8 space-y-14">
        {MARKDOWN_CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.id}
            id={cat.id}
            Icon={cat.icon}
            examples={cat.examples}
            t={t}
          />
        ))}
      </div>

      {/* Footer note */}
      <p className="mt-16 border-t border-border pt-6 text-sm text-muted-foreground">
        {t('flavorNote')}
      </p>
    </div>
  );
}
