import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { BannerGenerator } from '@/components/banner-generator/banner-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('banner', locale);
}

export default function BannerPage() {
  return <BannerGenerator />;
}
