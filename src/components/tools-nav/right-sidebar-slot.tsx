'use client';

import React from 'react';
import { useRightSidebar } from '@/lib/contexts/right-sidebar-context';

export function RightSidebarSlot() {
  const { content } = useRightSidebar();

  if (!content) return null;

  return (
    <aside className="hidden lg:flex w-72 shrink-0 flex-col border-l overflow-y-auto">
      {content}
    </aside>
  );
}
