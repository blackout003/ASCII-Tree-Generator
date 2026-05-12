"use client"

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Scale, ShieldCheck } from 'lucide-react';
import { Separator } from './separator';

export function FooterInternational() {
  const currentYear = new Date().getFullYear();
  const locale = useLocale();
  const t = useTranslations('footer');

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 pt-10 pb-6">

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 mb-10">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-semibold tracking-tight">
                ASCII Tree
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                free
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
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
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                {t('sourceCode')}
              </a>
            </nav>
          </div>

        </div>

        <Separator className="mb-5" />

        {/* Bottom bar */}
        <p className="text-center text-xs text-muted-foreground">
          {t('copyright', { year: currentYear })}
        </p>

      </div>
    </footer>
  );
}
