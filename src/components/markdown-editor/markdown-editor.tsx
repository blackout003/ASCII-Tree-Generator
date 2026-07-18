'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRightSidebar } from '@/lib/contexts/right-sidebar-context';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Eye, Copy, Code2, Download } from '@/components/icons';
import {
  MarkdownEditorOptions,
  DEFAULT_MARKDOWN_OPTIONS,
  DEFAULT_MARKDOWN,
} from '@/lib/markdown-editor-types';
import { MarkdownInput } from './markdown-input';
import { MarkdownPreview } from './markdown-preview';
import { MarkdownEditorOptionsPanel } from './markdown-editor-options-panel';

export function MarkdownEditor() {
  const t = useTranslations('markdownEditor');
  const { toast } = useToast();
  const { setContent } = useRightSidebar();

  const [input, setInput] = useState(DEFAULT_MARKDOWN);
  const [options, setOptions] = useState<MarkdownEditorOptions>(DEFAULT_MARKDOWN_OPTIONS);
  const previewContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContent(
      <MarkdownEditorOptionsPanel options={options} onOptionsChange={setOptions} />
    );
    return () => setContent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options]);

  const handleClear = useCallback(() => {
    setInput('');
  }, []);

  const copyMarkdown = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(input);
      toast({ description: t('errors.copyMarkdownSuccess') });
    } catch {
      toast({ description: t('errors.copyError'), variant: 'destructive' });
    }
  }, [input, t, toast]);

  const copyHtml = useCallback(async () => {
    try {
      const html = previewContentRef.current?.innerHTML ?? '';
      await navigator.clipboard.writeText(html);
      toast({ description: t('errors.copyHtmlSuccess') });
    } catch {
      toast({ description: t('errors.copyError'), variant: 'destructive' });
    }
  }, [t, toast]);

  const downloadMarkdown = useCallback(() => {
    try {
      const blob = new Blob([input], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.md';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ description: t('errors.downloadError'), variant: 'destructive' });
    }
  }, [input, t, toast]);

  const { viewMode, boxedPreview } = options;
  const showEditor = viewMode !== 'preview';
  const showPreview = viewMode !== 'editor';

  const previewPane = (
    <Card className={cn('flex flex-col min-h-0 gap-3 py-3', !showPreview && 'hidden')}>
      <CardHeader className="px-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            {t('preview.title')}
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyMarkdown} size="sm">
              <Copy className="w-4 h-4 mr-1" />
              {t('preview.copyMarkdown')}
            </Button>
            <Button onClick={copyHtml} size="sm" variant="outline">
              <Code2 className="w-4 h-4 mr-1" />
              {t('preview.copyHtml')}
            </Button>
            <Button onClick={downloadMarkdown} size="sm" variant="outline">
              <Download className="w-4 h-4 mr-1" />
              {t('preview.download')}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-y-auto px-4">
        <div className={cn('min-h-full', boxedPreview && 'rounded-md border bg-muted/30 p-4')}>
          {input.trim() ? (
            <MarkdownPreview source={input} contentRef={previewContentRef} />
          ) : (
            <p className="text-muted-foreground text-sm">{t('preview.placeholder')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col h-full p-2">
      <div
        className={cn(
          'grid gap-2 flex-1 min-h-0',
          viewMode === 'split' && 'grid-cols-1 lg:grid-cols-2'
        )}
      >
        <MarkdownInput
          value={input}
          onChange={setInput}
          onClear={handleClear}
          className={cn('min-h-0', !showEditor && 'hidden')}
        />
        {previewPane}
      </div>
    </div>
  );
}
