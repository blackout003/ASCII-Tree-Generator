import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { MarkdownGuide } from '@/components/markdown-guide/markdown-guide';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('markdown-guide', locale);
}

export default async function MarkdownGuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <MarkdownGuide />
      <ToolSeoSection tool="markdown-guide" locale={locale} />
    </>
  );
}
