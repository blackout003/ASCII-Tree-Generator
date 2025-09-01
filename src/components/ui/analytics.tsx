'use client';

import { useEffect } from 'react';
import { 
  initGoogleAnalytics, 
  initGoogleTagManager, 
  initHotjar, 
  initMatomo,
  ANALYTICS_CONFIG 
} from '@/lib/analytics';

export function Analytics() {
  useEffect(() => {
    // Initialiser tous les analytics
    if (ANALYTICS_CONFIG.googleAnalytics.enabled) {
      initGoogleAnalytics();
    }
    
    if (ANALYTICS_CONFIG.googleTagManager.enabled) {
      initGoogleTagManager();
    }
    
    if (ANALYTICS_CONFIG.hotjar.enabled) {
      initHotjar();
    }
    
    if (ANALYTICS_CONFIG.matomo.enabled) {
      initMatomo();
    }
  }, []);

  return null;
}

export function GoogleTagManagerNoScript() {
  if (!ANALYTICS_CONFIG.googleTagManager.enabled) {
    return null;
  }

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${ANALYTICS_CONFIG.googleTagManager.containerId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
