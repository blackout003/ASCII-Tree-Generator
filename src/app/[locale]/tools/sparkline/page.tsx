import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { AdSlot } from '@/components/ui/ad-slot';
import { SparklineGenerator } from '@/components/sparkline-generator/sparkline-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('sparkline', locale);
}

export default async function SparklinesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <SparklineGenerator />
      <AdSlot slot="sparkline-bottom" format="horizontal" className="container mx-auto my-6 px-4" />
      <ToolSeoSection tool="sparkline" locale={locale} />
    </>
  );
}
