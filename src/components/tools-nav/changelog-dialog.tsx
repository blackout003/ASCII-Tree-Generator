'use client';

import React from 'react';
import { History } from '@/components/icons';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { APP_VERSION, CHANGELOG } from '@/lib/changelog';

export function ChangelogDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarMenuButton
          size="sm"
          tooltip={`Version ${APP_VERSION}`}
          className="justify-center text-xs text-muted-foreground hover:text-foreground"
        >
          <History className="size-3.5" />
          <span className="group-data-[collapsible=icon]:hidden">
            Version {APP_VERSION}
          </span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5" />
            Notes de version
          </DialogTitle>
          <DialogDescription>
            Historique des évolutions de ASCII Tools.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-1">
          {CHANGELOG.map((entry) => (
            <div key={entry.version}>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  v{entry.version}
                </Badge>
                {entry.date && (
                  <span className="text-xs text-muted-foreground">
                    {entry.date}
                  </span>
                )}
              </div>

              {entry.summary && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {entry.summary}
                </p>
              )}

              {entry.sections.map((section) => (
                <div key={section.title} className="mt-3">
                  <h4 className="text-sm font-semibold">{section.title}</h4>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                    {section.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
