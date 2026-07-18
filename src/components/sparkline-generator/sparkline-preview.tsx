'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, Copy, Download } from '@/components/icons';
import { useTranslations } from 'next-intl';

interface SparklinePreviewProps {
  output: string;
  onCopy: () => void;
  onDownload: () => void;
}

export function SparklinePreview({ output, onCopy, onDownload }: SparklinePreviewProps) {
  const t = useTranslations('sparklineGenerator');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart2 className="w-5 h-5" />
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
      </CardContent>
    </Card>
  );
}
