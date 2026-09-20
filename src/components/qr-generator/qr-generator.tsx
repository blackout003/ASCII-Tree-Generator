'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRightSidebar } from '@/lib/contexts/right-sidebar-context';
import { useToast } from '@/hooks/use-toast';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { type QrFields, type QrOptions, type QrTemplate } from '@/lib/qr-types';
import { buildPayload, countChars, isWithinLimit, DEFAULT_FIELDS } from '@/lib/qr-templates';
import { generateMatrix, renderQr, toMarkdown } from '@/lib/qr-generator';
import { renderPngBlob } from '@/lib/qr-png';
import { QrInput } from './qr-input';
import { QrPreview } from './qr-preview';
import { QrOptionsPanel } from './qr-options-panel';

const EXAMPLE_URL = 'https://asciitree.fr';

const DEFAULT_OPTIONS: QrOptions = { style: 'half', ecc: 'M', invert: false };

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function QrGenerator() {
  const t = useTranslations('qrGenerator');
  const { toast } = useToast();
  const { setContent } = useRightSidebar();

  const [template, setTemplate] = useState<QrTemplate>('url');
  const [fields, setFields] = useState<QrFields>({ ...DEFAULT_FIELDS, url: EXAMPLE_URL });
  const [options, setOptions] = useState<QrOptions>(DEFAULT_OPTIONS);

  const payload = useMemo(() => buildPayload(template, fields), [template, fields]);
  const charCount = countChars(payload);

  // The counter reacts instantly; the (cheap) generation follows after a short pause.
  // The length is re-checked on the debounced value: it can lag behind and still be too long,
  // and feeding an over-long string to the encoder would throw.
  const debouncedPayload = useDebouncedValue(payload, 150);
  const safePayload = isWithinLimit(debouncedPayload) ? debouncedPayload : '';

  const matrix = useMemo(() => generateMatrix(safePayload, options.ecc), [safePayload, options.ecc]);
  const output = useMemo(
    () => renderQr(matrix, options.style, options.invert),
    [matrix, options.style, options.invert]
  );

  useEffect(() => {
    setContent(<QrOptionsPanel options={options} onOptionsChange={setOptions} />);
    return () => setContent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const handleClear = useCallback(() => setFields(DEFAULT_FIELDS), []);

  const copyText = useCallback(
    async (text: string, successKey: 'errors.copySuccess' | 'errors.copyMarkdownSuccess') => {
      try {
        await navigator.clipboard.writeText(text);
        toast({ description: t(successKey) });
      } catch {
        toast({ description: t('errors.copyError'), variant: 'destructive' });
      }
    },
    [t, toast]
  );

  const handleCopy = useCallback(() => copyText(output, 'errors.copySuccess'), [copyText, output]);
  const handleCopyMarkdown = useCallback(
    () => copyText(toMarkdown(output), 'errors.copyMarkdownSuccess'),
    [copyText, output]
  );

  const handleDownload = useCallback(() => {
    try {
      saveBlob(new Blob([output], { type: 'text/plain' }), 'qr-code.txt');
    } catch {
      toast({ description: t('errors.downloadError'), variant: 'destructive' });
    }
  }, [output, t, toast]);

  const handleDownloadPng = useCallback(async () => {
    try {
      saveBlob(await renderPngBlob(matrix), 'qr-code.png');
    } catch {
      toast({ description: t('errors.pngError'), variant: 'destructive' });
    }
  }, [matrix, t, toast]);

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <QrInput
        template={template}
        fields={fields}
        charCount={charCount}
        onTemplateChange={setTemplate}
        onFieldsChange={setFields}
        onClear={handleClear}
      />
      <QrPreview
        output={output}
        invert={options.invert}
        onCopy={handleCopy}
        onCopyMarkdown={handleCopyMarkdown}
        onDownload={handleDownload}
        onDownloadPng={handleDownloadPng}
      />
    </div>
  );
}
