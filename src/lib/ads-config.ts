// Configuration des emplacements publicitaires (Google AdSense)

export const ADS_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || '',
  enabled:
    process.env.NODE_ENV === 'production' &&
    Boolean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID),
};
