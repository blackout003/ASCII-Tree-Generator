import React from 'react';
import { RightSidebarProvider } from '@/lib/contexts/right-sidebar-context';
import { RightSidebarSlot } from '@/components/tools-nav/right-sidebar-slot';
import { AppLayout } from '@/components/tools-nav/app-layout';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      <RightSidebarProvider>
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
          <RightSidebarSlot />
        </div>
      </RightSidebarProvider>
    </AppLayout>
  );
}
