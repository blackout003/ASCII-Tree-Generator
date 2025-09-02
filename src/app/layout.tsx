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
            <script defer src="https://statistique.ganecloud.fr/script.js" data-website-id="e9526dfa-2a8c-47d6-be8c-7f67b581ef80"></script>
        {children}
      </body>
    </html>
  );
}
