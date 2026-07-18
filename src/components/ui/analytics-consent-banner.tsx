"use client";

import React from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ShieldCheck, X } from '@/components/icons';
import {
  ANALYTICS_CONSENT_EVENT,
  hasDecidedAnalyticsConsent,
  setAnalyticsConsent,
} from '@/lib/analytics-consent';

/**
 * Bannière de consentement affichée en bas à droite lors de l'arrivée sur le
 * site, tant que le visiteur n'a pas fait de choix. Pilote la collecte
 * statistique en modèle opt-in (aucun suivi tant que « Accepter » n'est pas cliqué).
 */
export function AnalyticsConsentBanner() {
  const t = useTranslations('cookieConsent');
  const locale = useLocale();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const sync = () => setVisible(!hasDecidedAnalyticsConsent());
    sync();
    // Se met à jour si le choix est fait ailleurs (autre onglet, page de confidentialité).
    window.addEventListener(ANALYTICS_CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  if (!visible) return null;

  const decide = (allow: boolean) => {
    setAnalyticsConsent(allow ? 'granted' : 'denied');
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t('title')}
      className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-xl border bg-background p-5 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 sm:w-96"
    >
      <button
        type="button"
        onClick={() => decide(false)}
        aria-label={t('refuse')}
        className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mb-2 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="text-sm font-semibold">{t('title')}</h2>
      </div>

      <p className="mb-4 text-sm text-muted-foreground">
        {t('description')}{' '}
        <Link
          href={`/${locale}/donnees-personnelles`}
          className="font-medium text-primary underline-offset-2 hover:underline"
        >
          {t('learnMore')}
        </Link>
      </p>

      <div className="flex gap-2">
        <Button size="sm" className="flex-1" onClick={() => decide(true)}>
          {t('accept')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          onClick={() => decide(false)}
        >
          {t('refuse')}
        </Button>
      </div>
    </div>
  );
}
