import { ADS_CONFIG } from '@/lib/ads-config';
import { cn } from '@/lib/utils';

type AdFormat = 'horizontal' | 'rectangle';

interface AdSlotProps {
  /** Nom de la zone (utilisé pour le libellé de debug et, plus tard, l'ad slot AdSense) */
  slot: string;
  format?: AdFormat;
  className?: string;
}

const FORMAT_STYLES: Record<AdFormat, string> = {
  horizontal: 'min-h-24 w-full',
  rectangle: 'min-h-60 w-full max-w-sm mx-auto',
};

/**
 * Emplacement publicitaire (Google AdSense).
 *
 * Tant qu'aucun `NEXT_PUBLIC_ADSENSE_CLIENT_ID` n'est configuré, ne rend rien
 * en production (pas d'espace vide pour les visiteurs) et affiche un encart
 * de repérage en développement.
 */
export function AdSlot({ slot, format = 'horizontal', className }: AdSlotProps) {
  if (!ADS_CONFIG.enabled) {
    if (process.env.NODE_ENV === 'production') return null;

    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 text-xs text-muted-foreground',
          FORMAT_STYLES[format],
          className
        )}
      >
        Emplacement publicitaire — {slot}
      </div>
    );
  }

  // TODO: brancher le script AdSense (<ins class="adsbygoogle">) une fois
  // NEXT_PUBLIC_ADSENSE_CLIENT_ID renseigné, en respectant le consentement
  // RGPD (voir src/lib/analytics-consent.ts).
  return null;
}
