'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRightSidebar } from '@/lib/contexts/right-sidebar-context';
import { useToast } from '@/hooks/use-toast';
import { BannerOptions } from '@/lib/banner-types';
import { generateBanner } from '@/lib/banner-generator';
import { BannerPreview } from './banner-preview';
import { BannerOptionsPanel } from './banner-options-panel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Type, X } from '@/components/icons';

const DEFAULT_TEXT = 'Hello';

const DEFAULT_OPTIONS: BannerOptions = {
  font: 'standard',
  align: 'left',
  spacing: 1,
};

export function BannerGenerator() {
  const t = useTranslations('bannerGenerator');
  const { toast } = useToast();
  const { setContent } = useRightSidebar();

  const [text, setText] = useState(DEFAULT_TEXT);
  const [options, setOptions] = useState<BannerOptions>(DEFAULT_OPTIONS);

  const output = useMemo(() => generateBanner(text || ' ', options), [text, options]);

  useEffect(() => {
    setContent(<BannerOptionsPanel options={options} onOptionsChange={setOptions} />);
    return () => setContent(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const handleClear = useCallback(() => setText(''), []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      toast({ description: t('errors.copySuccess') });
    } catch {
      toast({ description: t('errors.copyError'), variant: 'destructive' });
    }
  }, [output, t, toast]);

  const downloadOutput = useCallback(() => {
    try {
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'banner.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ description: t('errors.downloadError'), variant: 'destructive' });
    }
  }, [output, t, toast]);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="w-5 h-5" />
            {t('input.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="banner-text">{t('input.label')}</Label>
            <div className="flex gap-2">
              <Input
                id="banner-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('input.placeholder')}
                maxLength={30}
                className="font-mono"
              />
              {text && (
                <Button variant="ghost" size="icon" onClick={handleClear} title={t('input.clear')}>
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t('input.hint')}</p>
          </div>
        </CardContent>
      </Card>

      <BannerPreview
        output={output}
        onCopy={copyToClipboard}
        onDownload={downloadOutput}
      />
    </div>
  );
}
