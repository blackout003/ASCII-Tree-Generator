import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { AdSlot } from '@/components/ui/ad-slot';
import { SeparatorGenerator } from '@/components/separator-generator/separator-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('separators', locale);
}

export default async function SeparatorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <SeparatorGenerator />
      <AdSlot slot="separators-bottom" format="horizontal" className="container mx-auto my-6 px-4" />
      <ToolSeoSection tool="separators" locale={locale} />
    </>
  );
}
