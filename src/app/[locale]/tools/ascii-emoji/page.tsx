import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { AsciiEmoji } from '@/components/ascii-emoji/ascii-emoji';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('ascii-emoji', locale);
}

export default async function AsciiEmojiPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <AsciiEmoji />
      <ToolSeoSection tool="ascii-emoji" locale={locale} />
    </>
  );
}
