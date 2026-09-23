import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { AdSlot } from '@/components/ui/ad-slot';
import { TreeCommandsGenerator } from '@/components/tree-commands-generator/tree-commands-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('tree-to-commands', locale);
}

export default async function TreeToCommandsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <TreeCommandsGenerator />
      <AdSlot slot="tree-to-commands-bottom" format="horizontal" className="container mx-auto my-6 px-4" />
      <ToolSeoSection tool="tree-to-commands" locale={locale} />
    </>
  );
}
