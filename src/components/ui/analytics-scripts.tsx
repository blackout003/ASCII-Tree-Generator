"use client";

import { useEffect } from 'react';
import { init } from '@plausible-analytics/tracker';
import {
  ANALYTICS_CONSENT_EVENT,
  isAnalyticsGranted,
} from '@/lib/analytics-consent';

const PLAUSIBLE_DOMAIN = 'asciitree.fr';

let initialized = false;

/**
 * Passerelle client pour la collecte statistique (Plausible).
 * Modèle opt-in : le tracker n'est initialisé qu'après acceptation explicite.
 * Le package ne propose pas de « désinitialisation » : en cas de retrait du
 * consentement, `transformRequest` ignore tous les événements suivants.
 */
export function AnalyticsScripts() {
  useEffect(() => {
    const update = () => {
      if (initialized || !isAnalyticsGranted()) return;
      initialized = true;
      init({
        domain: PLAUSIBLE_DOMAIN,
        transformRequest: (payload) => (isAnalyticsGranted() ? payload : null),
      });
    };
    update();
    window.addEventListener(ANALYTICS_CONSENT_EVENT, update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, update);
      window.removeEventListener('storage', update);
    };
  }, []);

  return null;
}
