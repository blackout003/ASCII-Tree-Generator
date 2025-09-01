// Configuration des analytics et du suivi SEO

export const ANALYTICS_CONFIG = {
  // Google Analytics 4
  googleAnalytics: {
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX',
    enabled: process.env.NODE_ENV === 'production'
  },
  
  // Google Tag Manager
  googleTagManager: {
    containerId: process.env.NEXT_PUBLIC_GTM_CONTAINER_ID || 'GTM-XXXXXXX',
    enabled: process.env.NODE_ENV === 'production'
  },
  
  // Hotjar
  hotjar: {
    hjid: process.env.NEXT_PUBLIC_HOTJAR_ID || '0000000',
    hjsv: process.env.NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION || '6',
    enabled: process.env.NODE_ENV === 'production'
  },
  
  // Matomo
  matomo: {
    url: process.env.NEXT_PUBLIC_MATOMO_URL || 'https://your-matomo-domain.com',
    siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID || '1',
    enabled: process.env.NODE_ENV === 'production'
  }
};

// Fonction pour initialiser Google Analytics
export function initGoogleAnalytics() {
  if (typeof window !== 'undefined' && ANALYTICS_CONFIG.googleAnalytics.enabled) {
    // Google Analytics 4
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.googleAnalytics.measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', ANALYTICS_CONFIG.googleAnalytics.measurementId, {
      page_title: document.title,
      page_location: window.location.href,
    });
  }
}

// Fonction pour initialiser Google Tag Manager
export function initGoogleTagManager() {
  if (typeof window !== 'undefined' && ANALYTICS_CONFIG.googleTagManager.enabled) {
    (function(w: Window, d: Document, s: string, l: string, i: string) {
      (w as any)[l] = (w as any)[l] || [];
      (w as any)[l].push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
      const f = d.getElementsByTagName(s)[0];
      const j = d.createElement(s) as HTMLScriptElement;
      const dl = l !== 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode?.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', ANALYTICS_CONFIG.googleTagManager.containerId);
  }
}

// Fonction pour initialiser Hotjar
export function initHotjar() {
  if (typeof window !== 'undefined' && ANALYTICS_CONFIG.hotjar.enabled) {
    (function(h: Window, o: Document, t: string, j: string) {
      (h as any).hj = (h as any).hj || function() {
        ((h as any).hj.q = (h as any).hj.q || []).push(arguments);
      };
      (h as any)._hjSettings = {
        hjid: ANALYTICS_CONFIG.hotjar.hjid,
        hjsv: ANALYTICS_CONFIG.hotjar.hjsv
      };
      const a = o.getElementsByTagName('head')[0];
      const r = o.createElement('script') as HTMLScriptElement;
      r.async = true;
      r.src = t + (h as any)._hjSettings.hjid + j + (h as any)._hjSettings.hjsv;
      a.appendChild(r);
    })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
  }
}

// Fonction pour initialiser Matomo
export function initMatomo() {
  if (typeof window !== 'undefined' && ANALYTICS_CONFIG.matomo.enabled) {
    const _paq = window._paq = window._paq || [];
    _paq.push(['trackPageView']);
    _paq.push(['enableLinkTracking']);
    (function() {
      const u = ANALYTICS_CONFIG.matomo.url;
      _paq.push(['setTrackerUrl', u + 'matomo.php']);
      _paq.push(['setSiteId', ANALYTICS_CONFIG.matomo.siteId]);
      const d = document;
      const g = d.createElement('script') as HTMLScriptElement;
      const s = d.getElementsByTagName('script')[0];
      g.async = true;
      g.src = u + 'matomo.js';
      s.parentNode?.insertBefore(g, s);
    })();
  }
}

// Fonction pour tracker les événements personnalisés
export function trackEvent(eventName: string, parameters?: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', eventName, parameters);
    }
    
    // Matomo
    if (window._paq) {
      window._paq.push(['trackEvent', eventName, ...Object.values(parameters || {})]);
    }
    
    // Hotjar
    if (window.hj) {
      window.hj('event', eventName);
    }
  }
}

// Fonction pour tracker les conversions
export function trackConversion(conversionId: string, value?: number) {
  if (typeof window !== 'undefined') {
    // Google Ads
    if (window.gtag) {
      window.gtag('event', 'conversion', {
        'send_to': `AW-${conversionId}/conversion`,
        'value': value
      });
    }
  }
}

// Déclaration des types globaux
declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
    _paq: unknown[];
    hj: (...args: unknown[]) => void;
  }
}
