'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Trash2 } from '@/components/icons';
import { useTranslations } from 'next-intl';
import { BlockType } from '@/lib/separator-types';

interface SeparatorInputProps {
  label: string;
  blockType: BlockType;
  onLabelChange: (value: string) => void;
  onClear: () => void;
}

export function SeparatorInput({ label, blockType, onLabelChange, onClear }: SeparatorInputProps) {
  const t = useTranslations('separatorGenerator');

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2">
            <Minus className="w-5 h-5" />
            {t('input.title')}
          </CardTitle>
          <Button size="sm" variant="destructive" onClick={onClear}>
            <Trash2 className="w-4 h-4 mr-1" />
            {t('input.clear')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {blockType === 'line' ? (
          <p className="text-sm text-muted-foreground">{t('input.lineHint')}</p>
        ) : (
          <Input
            value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            placeholder={t('input.placeholder')}
            className="font-mono"
          />
        )}
      </CardContent>
    </Card>
  );
}
