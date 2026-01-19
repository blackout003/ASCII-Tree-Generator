import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { NextIntlClientProvider } from 'next-intl';
import { SEO_CONFIG, getLocaleMetadata } from '@/lib/seo-config';
import { Analytics, GoogleTagManagerNoScript } from '@/components/ui/analytics';
import { Toaster } from '@/components/ui/toaster';

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
      canonical: '/',
      languages: {
        'fr': '/fr',
        'en': '/en',
        'es': '/es',
        'de': '/de',
        'it': '/it',
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
      creator: SEO_CONFIG.social.twitter.handle,
      site: SEO_CONFIG.social.twitter.site,
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
  } catch {
    // Fallback to French messages if locale file doesn't exist
    messages = (await import('@/i18n/locales/fr.json')).default;
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script defer src="https://statistique.ganecloud.fr/script.js" data-website-id="e9526dfa-2a8c-47d6-be8c-7f67b581ef80"></script>
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
        
        {/* Analytics */}
        <Analytics />
        <GoogleTagManagerNoScript />
        
        {/* Toast notifications */}
        <Toaster />
      </body>
    </html>
  );
}
