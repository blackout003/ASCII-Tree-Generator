'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TreeOptions } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface TreeOptionsPanelProps {
  options: TreeOptions;
  onOptionsChange: (options: TreeOptions) => void;
}

/**
 * Composant pour les options de configuration de l'arbre
 */
export function TreeOptionsPanel({
  options,
  onOptionsChange,
}: TreeOptionsPanelProps) {
  const t = useTranslations();

  const handleOptionChange = (key: keyof TreeOptions, value: boolean | number) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>{t('options.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sortAlphabetically"
              checked={options.sortAlphabetically}
              onChange={(e) => handleOptionChange('sortAlphabetically', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="sortAlphabetically">{t('options.sortAlphabetically')}</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showHidden"
              checked={options.showHidden}
              onChange={(e) => handleOptionChange('showHidden', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showHidden">{t('options.showHidden')}</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeExtensions"
              checked={options.includeExtensions}
              onChange={(e) => handleOptionChange('includeExtensions', e.target.checked)}
              className="rounded"
            />
            <label htmlFor="includeExtensions">{t('options.includeExtensions')}</label>
          </div>
          
          <div className="flex items-center space-x-2">
            <label htmlFor="maxDepth">{t('options.maxDepth')}</label>
            <Input
              id="maxDepth"
              type="number"
              min="1"
              max="20"
              value={options.maxDepth}
              onChange={(e) => handleOptionChange('maxDepth', parseInt(e.target.value))}
              className="w-20"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
