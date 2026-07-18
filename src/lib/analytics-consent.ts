// Gestion du consentement à la collecte statistique (Umami, GA, GTM, Matomo, Hotjar).
//
// Modèle opt-in : aucun script de suivi n'est chargé tant que l'utilisateur n'a
// pas explicitement accepté (conforme aux recommandations de la CNIL). Le choix
// est stocké côté navigateur dans localStorage — rien n'est envoyé à nos serveurs.

/** Choix explicite de l'utilisateur. `null` = pas encore décidé. */
export type AnalyticsConsent = 'granted' | 'denied';

/** Clé localStorage conservant le choix de consentement. */
export const ANALYTICS_CONSENT_KEY = 'analytics-consent';

/** Clé native reconnue par le script Umami pour désactiver le suivi. */
const UMAMI_DISABLED_KEY = 'umami.disabled';

/** Événement diffusé quand le choix de consentement change (même onglet). */
export const ANALYTICS_CONSENT_EVENT = 'analytics-consent-change';

/** Renvoie le choix enregistré, ou `null` si l'utilisateur n'a pas encore décidé. */
export function getAnalyticsConsent(): AnalyticsConsent | null {
  if (typeof window === 'undefined') return null;
  try {
    const value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return value === 'granted' || value === 'denied' ? value : null;
  } catch {
    return null;
  }
}

/** `true` uniquement si l'utilisateur a explicitement accepté la collecte. */
export function isAnalyticsGranted(): boolean {
  return getAnalyticsConsent() === 'granted';
}

/** `true` si l'utilisateur a déjà fait un choix (accepté ou refusé). */
export function hasDecidedAnalyticsConsent(): boolean {
  return getAnalyticsConsent() !== null;
}

/**
 * Enregistre le choix de l'utilisateur et prévient les composants concernés.
 * En cas de refus, on positionne aussi `umami.disabled` pour bloquer le suivi
 * même si le script Umami avait déjà été chargé lors d'une visite précédente.
 */
export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
    if (consent === 'denied') {
      window.localStorage.setItem(UMAMI_DISABLED_KEY, '1');
    } else {
      window.localStorage.removeItem(UMAMI_DISABLED_KEY);
    }
    window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
  } catch {
    // localStorage indisponible (mode privé strict) : rien à faire.
  }
}
