"use client"

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Separator } from './separator';

export function FooterInternational() {
  const currentYear = new Date().getFullYear();
  const locale = useLocale();
  const t = useTranslations('footer');

  // Debug temporaire
  console.log('Footer locale:', locale);
  console.log('Footer copyright:', t('copyright', { year: currentYear }));

  return (
    <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-6">
        <Separator className="mb-6" />
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
              {t('copyright', { year: currentYear })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/fr/mentions-legales"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('legalNotice')}
            </Link>
            <Link
              href="/fr/donnees-personnelles"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('privacyPolicy')}
            </Link>
            <a
              href="https://github.com/blackout003"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
