import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { MarkdownGuide } from '@/components/markdown-guide/markdown-guide';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('markdown-guide', locale);
}

export default function MarkdownGuidePage() {
  return <MarkdownGuide />;
}
