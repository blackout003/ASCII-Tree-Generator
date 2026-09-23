'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Terminal, Trash2 } from '@/components/icons';
import { useTranslations } from 'next-intl';
import type { TreeCommandsMode } from '@/lib/tree-commands-types';

interface TreeCommandsInputProps {
  mode: TreeCommandsMode;
  input: string;
  errors: string[];
  warnings: string[];
  onInputChange: (value: string) => void;
  onClear: () => void;
}

export function TreeCommandsInput({
  mode,
  input,
  errors,
  warnings,
  onInputChange,
  onClear,
}: TreeCommandsInputProps) {
  const t = useTranslations('treeCommandsGenerator');
  const placeholder =
    mode === 'treeToCommands' ? t('input.placeholderTree') : t('input.placeholderCommands');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            {t('input.title')}
          </CardTitle>
          <Button size="sm" variant="destructive" onClick={onClear}>
            <Trash2 className="w-4 h-4 mr-1" />
            {t('input.clear')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder={placeholder}
          className="font-mono min-h-[160px] resize-y"
        />
        {warnings.length > 0 && (
          <ul className="space-y-1 text-sm text-amber-600 dark:text-amber-500">
            {warnings.map((path, i) => (
              <li key={i}>{t('warnings.dangerousPath', { path })}</li>
            ))}
          </ul>
        )}
        {errors.length > 0 && (
          <ul className="space-y-1 text-sm text-destructive">
            {errors.map((line, i) => (
              <li key={i}>{t('errors.unrecognizedLine', { line })}</li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
