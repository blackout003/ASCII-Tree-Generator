'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { BarChart2, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SparklineInputProps {
  input: string;
  valueCount: number;
  parseError: string | null;
  onInputChange: (value: string) => void;
  onClear: () => void;
}

export function SparklineInput({
  input,
  valueCount,
  parseError,
  onInputChange,
  onClear,
}: SparklineInputProps) {
  const t = useTranslations('sparklineGenerator');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
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
          placeholder={t('input.placeholder')}
          className="font-mono min-h-[100px] resize-y"
        />
        <div className="flex items-center gap-3 text-sm">
          {parseError ? (
            <span className="text-destructive">
              {t('input.parseError', { value: parseError })}
            </span>
          ) : valueCount > 0 ? (
            <span className="text-muted-foreground">
              {t('input.valuesFound', { count: valueCount })}
            </span>
          ) : (
            <span className="text-muted-foreground">
              {t('input.exampleLabel')}{' '}
              <code className="bg-muted px-1 rounded text-xs">{t('input.example')}</code>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
