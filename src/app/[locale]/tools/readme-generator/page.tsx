import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { AdSlot } from '@/components/ui/ad-slot';
import { ReadmeGenerator } from '@/components/readme-generator/readme-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  // Hidden from search engines until the profile mode ships (plan 3).
  return { ...buildToolMetadata('readme-generator', locale), robots: { index: false, follow: false } };
}

export default async function ReadmeGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <ReadmeGenerator />
      <AdSlot slot="readme-generator-bottom" format="horizontal" className="container mx-auto my-6 px-4" />
      <ToolSeoSection tool="readme-generator" locale={locale} />
    </>
  );
}
