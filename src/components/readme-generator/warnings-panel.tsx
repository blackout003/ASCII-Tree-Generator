'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ValidationWarning } from '@/lib/readme/types';

interface WarningsPanelProps {
  warnings: ValidationWarning[];
  /** Display name of each block, keyed by block id. */
  blockLabels: Record<string, string>;
}

export function WarningsPanel({ warnings, blockLabels }: WarningsPanelProps) {
  const t = useTranslations('readmeGenerator');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('warnings.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {warnings.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('warnings.none')}</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {warnings.map((warning, index) => (
              <li key={`${warning.blockId}-${warning.code}-${index}`}>
                <span className="font-medium">{blockLabels[warning.blockId]}</span>
                {' — '}
                {t(`warnings.${warning.code}`, warning.params ?? {})}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
