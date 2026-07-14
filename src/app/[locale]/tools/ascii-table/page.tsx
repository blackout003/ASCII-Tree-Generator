import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { TableGenerator } from '@/components/table-generator/table-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('ascii-table', locale);
}

export default async function AsciiTablePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <TableGenerator />
      <ToolSeoSection tool="ascii-table" locale={locale} />
    </>
  );
}
