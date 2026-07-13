import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { TableGenerator } from '@/components/table-generator/table-generator';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('ascii-table', locale);
}

export default function AsciiTablePage() {
  return <TableGenerator />;
}
