"use client";

import Script from 'next/script';
import { useEffect, useState } from 'react';
import {
  ANALYTICS_CONSENT_EVENT,
  isAnalyticsGranted,
} from '@/lib/analytics-consent';

const PLAUSIBLE_SCRIPT_URL =
  'https://analytics.egweb.fr/js/pa-vCXGDz53lPSYbZgRjPin0.js';

/**
 * Passerelle client pour la collecte statistique (Plausible, instance auto-hébergée).
 * Modèle opt-in : le script n'est monté qu'après acceptation explicite. Le choix
 * est relu à chaque changement de consentement, y compris entre onglets.
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
      <Script src={PLAUSIBLE_SCRIPT_URL} strategy="afterInteractive" />
      <Script id="plausible-init" strategy="afterInteractive">
        {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()`}
      </Script>
    </>
  );
}
