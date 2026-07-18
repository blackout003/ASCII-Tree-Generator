import React from 'react';
import { cookies } from 'next/headers';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ToolsSidebar } from '@/components/tools-nav/tools-sidebar';
import { ToolsHeader } from '@/components/tools-nav/tools-header';

export async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="h-svh">
      <ToolsSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ToolsHeader />
        {children}
      </div>
    </SidebarProvider>
  );
}
