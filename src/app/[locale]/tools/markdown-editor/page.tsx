import type { Metadata } from 'next';
import { buildToolMetadata } from '@/lib/seo-config';
import { ToolSeoSection } from '@/components/tools/tool-seo-section';
import { MarkdownEditor } from '@/components/markdown-editor/markdown-editor';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return buildToolMetadata('markdown-editor', locale);
}

export default async function MarkdownEditorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <MarkdownEditor />
      <ToolSeoSection tool="markdown-editor" locale={locale} />
    </>
  );
}
