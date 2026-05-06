'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { File, Copy, Download, Sliders } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ASCIIPreviewProps {
  asciiOutput: string;
  onCopy: () => void;
  onDownload: () => void;
  onOpenOptions?: () => void;
}

/**
 * Composant pour la prévisualisation et l'export de l'arbre ASCII
 */
export function ASCIIPreview({
  asciiOutput,
  onCopy,
  onDownload,
  onOpenOptions,
}: ASCIIPreviewProps) {
  const t = useTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <File className="w-5 h-5" />
          {t('asciiPreview.title')}
        </CardTitle>
        <CardDescription>
          {t('asciiPreview.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex gap-2">
          <Button onClick={onCopy} size="sm">
            <Copy className="w-4 h-4 mr-1" />
            {t('asciiPreview.copy')}
          </Button>
          <Button onClick={onDownload} size="sm" variant="outline">
            <Download className="w-4 h-4 mr-1" />
            {t('asciiPreview.download')}
          </Button>
          {onOpenOptions && (
            <Button onClick={onOpenOptions} size="sm" variant="outline" className="gap-2">
              <Sliders className="w-4 h-4" />
              {t('options.title')}
            </Button>
          )}
        </div>
        
        <Textarea
          value={asciiOutput}
          readOnly
          className="font-mono text-sm min-h-[400px] resize-none"
          placeholder={t('asciiPreview.placeholder')}
        />
      </CardContent>
    </Card>
  );
}
