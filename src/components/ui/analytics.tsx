import Script from 'next/script';
import { ANALYTICS_CONFIG } from '@/lib/analytics';

export function Analytics() {
  const gaId = ANALYTICS_CONFIG.googleAnalytics.measurementId;
  const gtmId = ANALYTICS_CONFIG.googleTagManager.containerId;
  const gaEnabled = ANALYTICS_CONFIG.googleAnalytics.enabled && !gaId.includes('XXXXXXXXXX');
  const gtmEnabled = ANALYTICS_CONFIG.googleTagManager.enabled && !gtmId.includes('XXXXXXX');

  return (
    <>
      {gaEnabled && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}');`}
          </Script>
        </>
      )}
      {gtmEnabled && (
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}
    </>
  );
}

export function GoogleTagManagerNoScript() {
  const gtmId = ANALYTICS_CONFIG.googleTagManager.containerId;
  if (!ANALYTICS_CONFIG.googleTagManager.enabled || gtmId.includes('XXXXXXX')) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}
