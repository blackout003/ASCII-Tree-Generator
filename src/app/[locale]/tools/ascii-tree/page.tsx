import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import TreeGenerator from '@/components/generator/tree-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('ascii-tree', locale);
}

export default async function AsciiTreePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <TreeGenerator />
      <ToolSeoSection tool="ascii-tree" locale={locale} />
    </>
  );
}
