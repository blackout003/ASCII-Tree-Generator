"use client"

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Scale, ShieldCheck, Github } from 'lucide-react';
import { Separator } from './separator';
import { TOOLS, RESOURCES } from '@/lib/tools';

export function FooterInternational() {
  const currentYear = new Date().getFullYear();
  const locale = useLocale();
  const t = useTranslations('footer');
  const tNav = useTranslations('nav');

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 pt-12 pb-6">

        {/* Main grid */}
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-5 mb-10">

          {/* Brand */}
          <div className="col-span-2 flex flex-col gap-3 lg:col-span-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold tracking-tight">
                ASCII Tools
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                free
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              {t('tagline')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {t('madeWith')}{' '}
              <a
                href="https://github.com/blackout003"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground/70 hover:text-foreground transition-colors underline underline-offset-2"
              >
                blackout003
              </a>
            </p>
          </div>

          {/* Tools */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('tools')}
            </h3>
            <nav className="flex flex-col gap-2">
              {TOOLS.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={`/${locale}${tool.href}`}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tNav(tool.nameKey as Parameters<typeof tNav>[0])}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {tNav('resources')}
            </h3>
            <nav className="flex flex-col gap-2">
              {RESOURCES.map((resource) => {
                const Icon = resource.icon;
                return (
                  <Link
                    key={resource.id}
                    href={`/${locale}${resource.href}`}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tNav(resource.nameKey as Parameters<typeof tNav>[0])}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {t('links')}
            </h3>
            <nav className="flex flex-col gap-2">
              <Link
                href={`/${locale}/mentions-legales`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <Scale className="w-3.5 h-3.5" />
                {t('legalNotice')}
              </Link>
              <Link
                href={`/${locale}/donnees-personnelles`}
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('privacyPolicy')}
              </Link>
              <a
                href="https://github.com/blackout003/ASCII-Tree-Generator"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
              >
                <Github className="w-3.5 h-3.5" />
                {t('sourceCode')}
              </a>
            </nav>
          </div>

        </div>

        <Separator className="mb-5" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            {t('copyright', { year: currentYear })}
          </p>
          <a
            href="https://github.com/blackout003/ASCII-Tree-Generator"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>

      </div>
    </footer>
  );
}
