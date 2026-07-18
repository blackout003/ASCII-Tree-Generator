"use client";

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { Analytics, GoogleTagManagerNoScript } from '@/components/ui/analytics';
import {
  ANALYTICS_CONSENT_EVENT,
  isAnalyticsGranted,
} from '@/lib/analytics-consent';

const umamiScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;
const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

/**
 * Passerelle client pour l'ensemble des scripts de collecte statistique.
 * Modèle opt-in : les scripts (GA, GTM, Matomo, Hotjar, Umami) ne sont montés
 * que si l'utilisateur a explicitement accepté la collecte. Le choix est relu à
 * chaque changement de consentement, y compris entre onglets via `storage`.
 */
export function AnalyticsScripts() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const update = () => setEnabled(isAnalyticsGranted());
    update();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Analytics />
      <GoogleTagManagerNoScript />
      {umamiScriptUrl && umamiWebsiteId && (
        <Script
          src={umamiScriptUrl}
          data-website-id={umamiWebsiteId}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
