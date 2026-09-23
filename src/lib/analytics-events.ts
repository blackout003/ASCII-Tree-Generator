// Envoi d'événements custom vers Plausible (actions clés : copie, téléchargement).

import { isAnalyticsAllowed } from '@/lib/analytics-consent';

declare global {
  interface Window {
    plausible?: {
      (event: string, options?: { props?: Record<string, string | number | boolean> }): void;
      q?: unknown[];
      init?: (options?: unknown) => void;
    };
  }
}

/**
 * Envoie un événement Plausible avec des props personnalisées.
 * No-op silencieux si le suivi est refusé ou si le script n'est pas encore chargé.
 */
export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>
): void {
  if (typeof window === 'undefined') return;
  if (!isAnalyticsAllowed()) return;
  window.plausible?.(name, props ? { props } : undefined);
}
