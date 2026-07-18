import Link from 'next/link';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { defaultLocale } from '@/i18n/locales';
import './globals.css';

/**
 * Root-level 404 for paths that carry no locale prefix (e.g. `/random`).
 * The root layout renders no <html>/<body> and next-intl isn't available
 * here, so this page is fully self-contained and falls back to French copy,
 * with a link into the localized app.
 */

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: '404 — Page introuvable',
  robots: { index: false, follow: false },
};

const MASCOT = String.raw`        ╷
   ┌────┴────┐
   │  ●   ●  │
   │    ‿    │
   └──┬───┬──┘
   ┌──┴───┴──┐
   │  ?   ?  │
   └──┬───┬──┘
      ╵   ╵`;

export default function RootNotFound() {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div className="flex min-h-svh flex-col items-center justify-center gap-8 px-6 py-16 text-center">
          <pre className="animate-float select-none font-mono text-[13px] leading-tight text-primary sm:text-base">
            {MASCOT}
          </pre>

          <div className="space-y-3">
            <h1 className="bg-gradient-to-b from-foreground to-foreground/60 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-8xl">
              404
            </h1>
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
              Cette branche n’existe pas
            </h2>
            <p className="mx-auto max-w-md text-sm text-muted-foreground sm:text-base">
              La page que vous cherchez a été déplacée, supprimée, ou n’a jamais
              poussé sur l’arbre.
            </p>
          </div>

          <Link
            href={`/${defaultLocale}`}
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Retour à l’accueil
          </Link>
        </div>
      </body>
    </html>
  );
}
