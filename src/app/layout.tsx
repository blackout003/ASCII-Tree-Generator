import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Head from "next/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Générateur d'Arbre ASCII",
  description: "Visualisez et créez la structure parfaite de votre projet. Convertissez facilement en format ASCII pour votre documentation.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
          <Head>
            {process.env.NEXT_PUBLIC_STATS_URL && process.env.NEXT_PUBLIC_STATS_WEBSITE_ID && (
              <script 
                defer 
                src={process.env.NEXT_PUBLIC_STATS_URL} 
                data-website-id={process.env.NEXT_PUBLIC_STATS_WEBSITE_ID}
              />
            )}
          </Head>
        {children}
      </body>
    </html>
  );
}
