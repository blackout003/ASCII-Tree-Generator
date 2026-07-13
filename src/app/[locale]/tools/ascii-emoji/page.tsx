import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { AsciiEmoji } from '@/components/ascii-emoji/ascii-emoji';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('ascii-emoji', locale);
}

export default function AsciiEmojiPage() {
  return <AsciiEmoji />;
}
