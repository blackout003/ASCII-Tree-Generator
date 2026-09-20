'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Copy, Download, FileText, Image as ImageIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

interface QrPreviewProps {
  output: string;
  invert: boolean;
  onCopy: () => void;
  onCopyMarkdown: () => void;
  onDownload: () => void;
  onDownloadPng: () => void;
}

export function QrPreview({
  output,
  invert,
  onCopy,
  onCopyMarkdown,
  onDownload,
  onDownloadPng,
}: QrPreviewProps) {
  const t = useTranslations('qrGenerator');
  const empty = !output;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          {t('preview.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex flex-wrap gap-2">
          <Button onClick={onCopy} size="sm" disabled={empty}>
            <Copy className="w-4 h-4 mr-1" />
            {t('preview.copy')}
          </Button>
          <Button onClick={onCopyMarkdown} size="sm" variant="outline" disabled={empty}>
            <FileText className="w-4 h-4 mr-1" />
            {t('preview.copyMarkdown')}
          </Button>
          <Button onClick={onDownload} size="sm" variant="outline" disabled={empty}>
            <Download className="w-4 h-4 mr-1" />
            {t('preview.download')}
          </Button>
          <Button onClick={onDownloadPng} size="sm" variant="outline" disabled={empty}>
            <ImageIcon className="w-4 h-4 mr-1" />
            {t('preview.downloadPng')}
          </Button>
        </div>

        {empty ? (
          <div className="rounded-md bg-muted p-4 min-h-[120px] text-sm text-muted-foreground">
            {t('preview.placeholder')}
          </div>
        ) : (
          // Colors are forced (not theme-dependent): a QR code is only scannable with the
          // right polarity. Inverted output is drawn on black so it keeps that polarity.
          <pre
            role="img"
            aria-label={t('preview.ariaLabel')}
            className={cn(
              'font-mono text-[10px] leading-[1] rounded-md p-4 min-h-[120px] overflow-x-auto whitespace-pre',
              invert ? 'bg-black text-white' : 'bg-white text-black'
            )}
          >
            {output}
          </pre>
        )}

        <div className="mt-3 space-y-1 text-xs text-muted-foreground">
          <p>{t('preview.monospaceNote')}</p>
          <p>{t('preview.pngNote')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
