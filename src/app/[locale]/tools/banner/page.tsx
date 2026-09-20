import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { AdSlot } from '@/components/ui/ad-slot';
import { BannerGenerator } from '@/components/banner-generator/banner-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('banner', locale);
}

export default async function BannerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <BannerGenerator />
      <AdSlot slot="banner-bottom" format="horizontal" className="container mx-auto my-6 px-4" />
      <ToolSeoSection tool="banner" locale={locale} />
    </>
  );
}
