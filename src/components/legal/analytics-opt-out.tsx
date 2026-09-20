"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Check } from '@/components/icons';
import {
  ANALYTICS_CONSENT_EVENT,
  isAnalyticsAllowed,
  isDoNotTrackEnabled,
  setAnalyticsConsent,
  type AnalyticsConsent,
} from '@/lib/analytics-consent';

/**
 * Carte permettant à l'utilisateur d'accepter ou de refuser la collecte
 * statistique depuis la page de confidentialité. Le choix est stocké
 * localement dans le navigateur. Tant qu'aucun refus n'est enregistré, le suivi
 * est actif (opt-out), sauf si le navigateur envoie « Ne pas suivre ».
 */
export function AnalyticsOptOut() {
  const [allowed, setAllowed] = React.useState(false);
  const [dnt, setDnt] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    const sync = () => {
      setAllowed(isAnalyticsAllowed());
      setDnt(isDoNotTrackEnabled());
    };
    sync();
    setMounted(true);
    window.addEventListener(ANALYTICS_CONSENT_EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(ANALYTICS_CONSENT_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const granted = allowed;

  const handleToggle = (allow: boolean) => {
    const next: AnalyticsConsent = allow ? 'granted' : 'denied';
    setAnalyticsConsent(next);
    setAllowed(allow && !dnt);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Collecte statistique
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Nous utilisons un outil de mesure d&apos;audience respectueux de la vie privée (Plausible Analytics) pour comprendre l&apos;usage du site. Le suivi est actif par
          défaut, mais vous pouvez le refuser à tout moment ci-dessous ; il est aussi
          désactivé automatiquement si votre navigateur envoie le signal « Ne pas
          suivre ». Votre choix est enregistré uniquement dans votre navigateur.
        </p>

        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
          <div className="space-y-1">
            <Label htmlFor="analytics-consent" className="text-base font-medium">
              Autoriser le suivi statistique
            </Label>
            <p className="text-sm text-muted-foreground">
              {dnt
                ? 'Le suivi est désactivé : votre navigateur envoie « Ne pas suivre ».'
                : granted
                  ? 'Le suivi est actuellement autorisé sur cet appareil.'
                  : 'Le suivi est actuellement désactivé sur cet appareil.'}
            </p>
          </div>
          <Switch
            id="analytics-consent"
            checked={granted}
            onCheckedChange={handleToggle}
            disabled={dnt}
            aria-label="Autoriser le suivi statistique"
          />
        </div>

        {mounted && (
          <Badge variant="secondary" className="flex w-fit items-center gap-1">
            <Check className="h-3.5 w-3.5" />
            {granted ? 'Collecte autorisée' : 'Collecte désactivée'}
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
