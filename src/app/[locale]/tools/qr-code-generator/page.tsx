import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { AdSlot } from '@/components/ui/ad-slot';
import { QrGenerator } from '@/components/qr-generator/qr-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('qr-code-generator', locale);
}

export default async function QrCodeGeneratorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <QrGenerator />
      <AdSlot slot="qr-code-generator-bottom" format="horizontal" className="container mx-auto my-6 px-4" />
      <ToolSeoSection tool="qr-code-generator" locale={locale} />
    </>
  );
}
