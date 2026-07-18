'use client';

import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import { MarkdownEditorOptions, ViewMode } from '@/lib/markdown-editor-types';

interface MarkdownEditorOptionsPanelProps {
  options: MarkdownEditorOptions;
  onOptionsChange: (options: MarkdownEditorOptions) => void;
}

export function MarkdownEditorOptionsPanel({
  options,
  onOptionsChange,
}: MarkdownEditorOptionsPanelProps) {
  const t = useTranslations('markdownEditor');

  const set = <K extends keyof MarkdownEditorOptions>(
    key: K,
    value: MarkdownEditorOptions[K]
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-sm mb-4">{t('options.title')}</h2>
      <div className="space-y-6 pb-6">
        <div className="space-y-2">
          <Label htmlFor="viewMode">{t('options.viewMode')}</Label>
          <Select
            value={options.viewMode}
            onValueChange={(v) => set('viewMode', v as ViewMode)}
          >
            <SelectTrigger id="viewMode" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="split">{t('options.viewSplit')}</SelectItem>
              <SelectItem value="editor">{t('options.viewEditor')}</SelectItem>
              <SelectItem value="preview">{t('options.viewPreview')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <Label htmlFor="boxedPreview">{t('options.boxedPreview')}</Label>
          <Switch
            id="boxedPreview"
            checked={options.boxedPreview}
            onCheckedChange={(v) => set('boxedPreview', v)}
          />
        </div>
      </div>
    </div>
  );
}
