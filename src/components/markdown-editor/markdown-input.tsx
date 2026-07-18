'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit3, Trash2 } from '@/components/icons';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { MarkdownToolbar } from './markdown-toolbar';

interface MarkdownInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  /** Export actions rendered in the header (kept reachable in every view mode). */
  actions?: React.ReactNode;
  className?: string;
}

export function MarkdownInput({ value, onChange, onClear, actions, className }: MarkdownInputProps) {
  const t = useTranslations('markdownEditor');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  return (
    <Card className={cn('flex flex-col min-h-0 gap-3 py-3', className)}>
      <CardHeader className="gap-2 px-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            {t('editor.title')}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            <Button size="sm" variant="destructive" onClick={onClear}>
              <Trash2 className="w-4 h-4 mr-1" />
              {t('editor.clear')}
            </Button>
          </div>
        </div>
        <MarkdownToolbar textareaRef={textareaRef} value={value} onChange={onChange} />
      </CardHeader>
      <CardContent className="flex-1 min-h-0 px-4">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('editor.placeholder')}
          className="font-mono text-sm h-full min-h-[200px] resize-none leading-relaxed"
          spellCheck={false}
        />
      </CardContent>
    </Card>
  );
}
