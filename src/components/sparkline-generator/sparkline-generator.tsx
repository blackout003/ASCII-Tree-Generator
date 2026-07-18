'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRightSidebar } from '@/lib/contexts/right-sidebar-context';
import { useToast } from '@/hooks/use-toast';
import { SparklineOptions } from '@/lib/sparkline-types';
import { parseInput, generateChart } from '@/lib/sparkline-generator';
import { SparklineInput } from './sparkline-input';
import { SparklinePreview } from './sparkline-preview';
import { SparklineOptionsPanel } from './sparkline-options-panel';

const DEFAULT_INPUT = '1, 3, 5, 2, 8, 4';

const DEFAULT_OPTIONS: SparklineOptions = {
  chartType: 'sparkline',
  barHeight: 8,
  showValues: true,
  barSpacing: true,
  fillChar: '█',
};

export function SparklineGenerator() {
  const t = useTranslations('sparklineGenerator');
  const { toast } = useToast();
  const { setContent } = useRightSidebar();

  const [input, setInput] = useState(DEFAULT_INPUT);
  const [options, setOptions] = useState<SparklineOptions>(DEFAULT_OPTIONS);

  const parsed = useMemo(() => parseInput(input), [input]);

  const output = useMemo(
    () => generateChart(parsed.values, options),
    [parsed.values, options]
  );

  useEffect(() => {
    setContent(
      <SparklineOptionsPanel options={options} onOptionsChange={setOptions} />
    );
    return () => setContent(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

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
      a.download = 'sparkline.txt';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ description: t('errors.downloadError'), variant: 'destructive' });
    }
  }, [output, t, toast]);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <SparklineInput
        input={input}
        valueCount={parsed.values.length}
        parseError={parsed.error}
        onInputChange={setInput}
        onClear={handleClear}
      />
      <SparklinePreview
        output={output}
        onCopy={copyToClipboard}
        onDownload={downloadOutput}
      />
    </div>
  );
}
