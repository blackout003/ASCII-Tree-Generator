'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { TOOLS } from '@/lib/tools';

export function ToolsHeader() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const currentTool = TOOLS.find((tool) => pathname.includes(tool.href));
  const isToolsSection = pathname.includes('/tools');
  const toolName = currentTool
    ? t(currentTool.nameKey as Parameters<typeof t>[0])
    : isToolsSection
      ? t('tools')
      : t('home');

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <span className="text-sm font-medium">{toolName}</span>
    </header>
  );
}
