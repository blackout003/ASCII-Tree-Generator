'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRightSidebar } from '@/lib/contexts/right-sidebar-context';
import { useToast } from '@/hooks/use-toast';
import { SeparatorOptions } from '@/lib/separator-types';
import { generateBlock } from '@/lib/separator-generator';
import { SeparatorInput } from './separator-input';
import { SeparatorPreview } from './separator-preview';
import { SeparatorOptionsPanel } from './separator-options-panel';
import { trackEvent } from '@/lib/analytics-events';

const DEFAULT_LABEL = 'STATUS: ACTIVE';

const DEFAULT_OPTIONS: SeparatorOptions = {
  blockType: 'line',
  width: 40,
  lineChar: '─',
  badgeStyle: 'brackets',
  commentLang: 'c',
};

export function SeparatorGenerator() {
  const t = useTranslations('separatorGenerator');
  const { toast } = useToast();
  const { setContent } = useRightSidebar();

  const [label, setLabel] = useState(DEFAULT_LABEL);
  const [options, setOptions] = useState<SeparatorOptions>(DEFAULT_OPTIONS);

  const output = useMemo(() => generateBlock(label, options), [label, options]);

  useEffect(() => {
    setContent(
      <SeparatorOptionsPanel options={options} onOptionsChange={setOptions} />
    );
    return () => setContent(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const handleClear = useCallback(() => {
    setLabel('');
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(output);
      trackEvent('Copy', { tool: 'separator-generator', blockType: options.blockType });
      toast({ description: t('errors.copySuccess') });
    } catch {
      toast({ description: t('errors.copyError'), variant: 'destructive' });
    }
  }, [output, t, toast, options.blockType]);

  const downloadOutput = useCallback(() => {
    try {
      const blob = new Blob([output], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'separator.txt';
      a.click();
      URL.revokeObjectURL(url);
      trackEvent('Download', { tool: 'separator-generator', format: 'txt', blockType: options.blockType });
    } catch {
      toast({ description: t('errors.downloadError'), variant: 'destructive' });
    }
  }, [output, t, toast, options.blockType]);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <SeparatorInput
        label={label}
        blockType={options.blockType}
        onLabelChange={setLabel}
        onClear={handleClear}
      />
      <SeparatorPreview
        output={output}
        onCopy={copyToClipboard}
        onDownload={downloadOutput}
      />
    </div>
  );
}
