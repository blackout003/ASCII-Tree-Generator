import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { SparklineGenerator } from '@/components/sparkline-generator/sparkline-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('sparkline', locale);
}

export default function SparklinesPage() {
  return <SparklineGenerator />;
}
