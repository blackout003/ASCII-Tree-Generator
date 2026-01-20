'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TreeOptions } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface TreeOptionsPanelProps {
  options: TreeOptions;
  onOptionsChange: (options: TreeOptions) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Composant pour les options de configuration de l'arbre dans un Sheet
 */
export function TreeOptionsPanel({
  options,
  onOptionsChange,
  open,
  onOpenChange,
}: TreeOptionsPanelProps) {
  const t = useTranslations();

  const handleOptionChange = (key: keyof TreeOptions, value: boolean | number) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Configuration Options</SheetTitle>
          <SheetDescription>
            Configuration Options
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sortAlphabetically">{t('options.sortAlphabetically')}</Label>
            </div>
            <Switch
              id="sortAlphabetically"
              checked={options.sortAlphabetically}
              onCheckedChange={(checked) => handleOptionChange('sortAlphabetically', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showHidden">{t('options.showHidden')}</Label>
            </div>
            <Switch
              id="showHidden"
              checked={options.showHidden}
              onCheckedChange={(checked) => handleOptionChange('showHidden', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="includeExtensions">{t('options.includeExtensions')}</Label>
            </div>
            <Switch
              id="includeExtensions"
              checked={options.includeExtensions}
              onCheckedChange={(checked) => handleOptionChange('includeExtensions', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="showFolderSlash">{t('options.showFolderSlash')}</Label>
            </div>
            <Switch
              id="showFolderSlash"
              checked={options.showFolderSlash}
              onCheckedChange={(checked) => handleOptionChange('showFolderSlash', checked)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="maxDepth">{t('options.maxDepth')}</Label>
            <Input
              id="maxDepth"
              type="number"
              min="1"
              max="20"
              value={options.maxDepth}
              onChange={(e) => handleOptionChange('maxDepth', parseInt(e.target.value) || 1)}
              className="w-full"
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
