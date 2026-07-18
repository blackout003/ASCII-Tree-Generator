import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
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
      <ToolSeoSection tool="banner" locale={locale} />
    </>
  );
}
