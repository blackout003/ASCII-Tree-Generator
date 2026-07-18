'use client';

import React, { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy } from '@/components/icons';
import { useToast } from '@/hooks/use-toast';
import { ASCII_EMOJI_CATEGORIES } from '@/lib/ascii-emoji-data';
import { cn } from '@/lib/utils';

type GuideT = ReturnType<typeof useTranslations>;

function EmojiChip({ value, label }: { value: string; label: string }) {
  const t = useTranslations('asciiEmoji');
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ description: t('copyError'), variant: 'destructive' });
    }
  }, [value, t, toast]);

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`${label} — ${copied ? t('copied') : t('copy')}`}
      className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-muted/20 p-4 text-center transition-colors hover:border-foreground/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="flex min-h-8 items-center font-mono text-lg text-foreground">
        {value}
      </span>
      <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
        {copied ? (
          <>
            <Check className="size-3 text-foreground" />
            {t('copied')}
          </>
        ) : (
          <>
            <Copy className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
            {label}
          </>
        )}
      </span>
    </button>
  );
}

function CategorySection({
  id,
  Icon,
  emojis,
  t,
}: {
  id: string;
  Icon: React.ComponentType<{ className?: string }>;
  emojis: { value: string; labelKey: string }[];
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

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {emojis.map((e) => (
          <EmojiChip key={e.labelKey} value={e.value} label={t(`labels.${e.labelKey}` as never)} />
        ))}
      </div>
    </section>
  );
}

export function AsciiEmoji() {
  const t = useTranslations('asciiEmoji');
  const [activeId, setActiveId] = useState<string>(ASCII_EMOJI_CATEGORIES[0].id);

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
          {ASCII_EMOJI_CATEGORIES.map((cat) => (
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
        {ASCII_EMOJI_CATEGORIES.map((cat) => (
          <CategorySection
            key={cat.id}
            id={cat.id}
            Icon={cat.icon}
            emojis={cat.emojis}
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
