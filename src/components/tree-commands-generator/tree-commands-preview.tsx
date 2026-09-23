'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Terminal, Copy, Download } from '@/components/icons';
import { useTranslations } from 'next-intl';
import type { TreeCommandsMode } from '@/lib/tree-commands-types';

interface TreeCommandsPreviewProps {
  mode: TreeCommandsMode;
  output: string;
  onCopy: () => void;
  onDownload: () => void;
}

export function TreeCommandsPreview({ mode, output, onCopy, onDownload }: TreeCommandsPreviewProps) {
  const t = useTranslations('treeCommandsGenerator');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          {t('preview.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Button onClick={onCopy} size="sm">
            <Copy className="w-4 h-4 mr-1" />
            {t('preview.copy')}
          </Button>
          <Button onClick={onDownload} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-1" />
            {t('preview.download')}
          </Button>
        </div>
        <pre className="font-mono text-sm bg-muted rounded-md p-4 min-h-[120px] overflow-x-auto whitespace-pre leading-tight">
          {output || t('preview.placeholder')}
        </pre>
        {mode === 'treeToCommands' && (
          <p className="mt-3 text-xs text-muted-foreground">{t('preview.securityNotice')}</p>
        )}
      </CardContent>
    </Card>
  );
}
