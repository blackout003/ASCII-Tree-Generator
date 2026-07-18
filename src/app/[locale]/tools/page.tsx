import { redirect } from 'next/navigation';

export default async function ToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/tools/ascii-tree`);
}
