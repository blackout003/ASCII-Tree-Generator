import React from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { SEO_CONFIG, getLocaleMetadata } from '@/lib/seo-config';
import { Analytics, GoogleTagManagerNoScript } from '@/components/ui/analytics';
import { Toaster } from '@/components/ui/toaster';
import { StructuredData } from '@/components/ui/structured-data-server';
import { generateWebsiteStructuredData, generateBreadcrumbStructuredData } from '@/lib/structured-data-server';
import { locales, defaultLocale } from '@/i18n/locales';
import { SpeedInsights } from "@vercel/speed-insights/next";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const localeMeta = getLocaleMetadata(locale);
  
  return {
    title: localeMeta.title,
    description: localeMeta.description,
    keywords: SEO_CONFIG.keywords,
    authors: [{ name: "ASCII Tree Generator Team" }],
    creator: SEO_CONFIG.siteName,
    publisher: SEO_CONFIG.siteName,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(SEO_CONFIG.baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, `/${l}`])),
        'x-default': `/${defaultLocale}`,
      },
    },
    openGraph: {
      title: localeMeta.title,
      description: localeMeta.description,
      url: SEO_CONFIG.baseUrl,
      siteName: SEO_CONFIG.siteName,
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: localeMeta.title,
        },
      ],
      locale: locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: localeMeta.title,
      description: localeMeta.description,
      images: ['/og-image.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: SEO_CONFIG.verification,
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  let messages;
  try {
    messages = (await import(`@/i18n/locales/${locale}.json`)).default;
  } catch (importError) {
    // Fallback au locale par défaut si le fichier de locale n'existe pas
    try {
      messages = (await import(`@/i18n/locales/${defaultLocale}.json`)).default;
    } catch (fallbackError) {
      // Si même le fallback échoue, on utilise un objet vide pour éviter de casser l'application
      console.error('Impossible de charger les traductions:', importError);
      messages = {};
    }
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>

        {/* Structured data (JSON-LD) — rendered outside the client provider tree
            so the <script> tags are server-only and never re-rendered on the client. */}
        <StructuredData data={generateWebsiteStructuredData()} />
        <StructuredData data={generateBreadcrumbStructuredData()} />

        {/* Analytics */}
        <Analytics />
        <GoogleTagManagerNoScript />
        <SpeedInsights />

        {/* Toast notifications */}
        <Toaster />
      </body>
      {process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL && process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
        <Script
          src={process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
          data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          strategy="afterInteractive"
        />
      )}
    </html>
  );
}
