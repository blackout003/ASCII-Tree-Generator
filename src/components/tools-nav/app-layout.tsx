import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ToolsSidebar } from '@/components/tools-nav/tools-sidebar';
import { ToolsHeader } from '@/components/tools-nav/tools-header';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-svh">
      <ToolsSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ToolsHeader />
        {children}
      </div>
    </SidebarProvider>
  );
}
