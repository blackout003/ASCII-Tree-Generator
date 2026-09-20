// Gestion du consentement à la collecte statistique (Plausible).
//
// Modèle opt-out : le suivi est actif par défaut, sauf si l'utilisateur l'a
// refusé ou si son navigateur envoie « Ne pas suivre » (DNT) / Global Privacy
// Control. Le choix est stocké côté navigateur dans localStorage — rien n'est
// envoyé à nos serveurs.

/** Choix explicite de l'utilisateur. `null` = pas de choix (suivi actif par défaut). */
export type AnalyticsConsent = 'granted' | 'denied';

/** Clé localStorage conservant le choix de consentement. */
export const ANALYTICS_CONSENT_KEY = 'analytics-consent';

/** Clé native reconnue par le script Plausible pour ignorer le suivi. */
const PLAUSIBLE_IGNORE_KEY = 'plausible_ignore';

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

/** `true` si le navigateur signale « Ne pas suivre » (DNT) ou Global Privacy Control. */
export function isDoNotTrackEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  const dnt = nav.doNotTrack ?? (window as unknown as { doNotTrack?: string }).doNotTrack;
  return dnt === '1' || dnt === 'yes' || nav.globalPrivacyControl === true;
}

/** `true` si le suivi est autorisé : pas de refus explicite et pas de « Ne pas suivre ». */
export function isAnalyticsAllowed(): boolean {
  return !isDoNotTrackEnabled() && getAnalyticsConsent() !== 'denied';
}

/** `true` si l'utilisateur a déjà fait un choix (accepté ou refusé). */
export function hasDecidedAnalyticsConsent(): boolean {
  return getAnalyticsConsent() !== null;
}

/**
 * Enregistre le choix de l'utilisateur et prévient les composants concernés.
 * En cas de refus, on positionne aussi `plausible_ignore` pour bloquer le suivi
 * même si le script Plausible était déjà chargé dans la page.
 */
export function setAnalyticsConsent(consent: AnalyticsConsent): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent);
    if (consent === 'denied') {
      window.localStorage.setItem(PLAUSIBLE_IGNORE_KEY, 'true');
    } else {
      window.localStorage.removeItem(PLAUSIBLE_IGNORE_KEY);
    }
    window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
  } catch {
    // localStorage indisponible (mode privé strict) : rien à faire.
  }
}
