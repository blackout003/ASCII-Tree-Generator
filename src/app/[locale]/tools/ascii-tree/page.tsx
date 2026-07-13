import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import TreeGenerator from '@/components/generator/tree-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('ascii-tree', locale);
}

export default function AsciiTreePage() {
  return <TreeGenerator />;
}
