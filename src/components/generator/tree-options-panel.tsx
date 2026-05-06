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
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TreeOptions, ConnectorStyle, SortOrder, SortDirection } from '@/lib/types';
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

  const handleOptionChange = (key: keyof TreeOptions, value: boolean | number | string | string[]) => {
    onOptionsChange({
      ...options,
      [key]: value,
    });
  };

  const handleMultipleOptionChanges = (changes: Partial<TreeOptions>) => {
    onOptionsChange({
      ...options,
      ...changes,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t('options.title')}</SheetTitle>
          <SheetDescription>
            {t('options.title')}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6 pb-6">
          {/* Options de base */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Options de base</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sortAlphabetically">{t('options.sortAlphabetically')}</Label>
                <Switch
                  id="sortAlphabetically"
                  checked={options.sortAlphabetically}
                  onCheckedChange={(checked) => handleOptionChange('sortAlphabetically', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showHidden">{t('options.showHidden')}</Label>
                <Switch
                  id="showHidden"
                  checked={options.showHidden}
                  onCheckedChange={(checked) => handleOptionChange('showHidden', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="includeExtensions">{t('options.includeExtensions')}</Label>
                <Switch
                  id="includeExtensions"
                  checked={options.includeExtensions}
                  onCheckedChange={(checked) => handleOptionChange('includeExtensions', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="showFolderSlash">{t('options.showFolderSlash')}</Label>
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
          </div>

          <Separator />

          {/* Formatage ASCII */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Formatage ASCII</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="connectorStyle">Style de connecteurs</Label>
                <Select
                  value={options.connectorStyle}
                  onValueChange={(value) => handleOptionChange('connectorStyle', value as ConnectorStyle)}
                >
                  <SelectTrigger id="connectorStyle" className="w-full">
                    <SelectValue placeholder="Sélectionner un style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unicode">Unicode (├──, └──, │)</SelectItem>
                    <SelectItem value="ascii">ASCII (|--, `--, |)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="indentSize">Taille d'indentation</Label>
                <Input
                  id="indentSize"
                  type="number"
                  min="1"
                  max="8"
                  value={options.indentSize}
                  onChange={(e) => handleOptionChange('indentSize', parseInt(e.target.value) || 4)}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="useTabs">Utiliser des tabulations</Label>
                <Switch
                  id="useTabs"
                  checked={options.useTabs}
                  onCheckedChange={(checked) => handleOptionChange('useTabs', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showRootPrefix">Afficher le préfixe racine</Label>
                <Switch
                  id="showRootPrefix"
                  checked={options.showRootPrefix}
                  onCheckedChange={(checked) => handleOptionChange('showRootPrefix', checked)}
                />
              </div>

              {options.showRootPrefix && (
                <div className="space-y-2">
                  <Label htmlFor="rootPrefix">Préfixe racine</Label>
                  <Input
                    id="rootPrefix"
                    type="text"
                    value={options.rootPrefix}
                    onChange={(e) => handleOptionChange('rootPrefix', e.target.value)}
                    className="w-full"
                    placeholder="Ex: ."
                  />
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Tri */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Tri</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Ordre de tri</Label>
                <Select
                  value={options.sortOrder}
                  onValueChange={(value) => handleOptionChange('sortOrder', value as SortOrder)}
                >
                  <SelectTrigger id="sortOrder" className="w-full">
                    <SelectValue placeholder="Sélectionner un ordre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alphabetical">Alphabétique</SelectItem>
                    <SelectItem value="type">Par type (dossiers puis fichiers)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortDirection">Sens de tri</Label>
                <Select
                  value={options.sortDirection}
                  onValueChange={(value) => handleOptionChange('sortDirection', value as SortDirection)}
                >
                  <SelectTrigger id="sortDirection" className="w-full">
                    <SelectValue placeholder="Sélectionner un sens" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Croissant</SelectItem>
                    <SelectItem value="desc">Décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Structure */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Structure</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="compressEmptyFolders">Compresser les dossiers vides</Label>
                <Switch
                  id="compressEmptyFolders"
                  checked={options.compressEmptyFolders}
                  onCheckedChange={(checked) => handleOptionChange('compressEmptyFolders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showOnlyFiles">Afficher uniquement les fichiers</Label>
                <Switch
                  id="showOnlyFiles"
                  checked={options.showOnlyFiles}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleMultipleOptionChanges({
                        showOnlyFiles: true,
                        showOnlyFolders: false,
                      });
                    } else {
                      handleOptionChange('showOnlyFiles', false);
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showOnlyFolders">Afficher uniquement les dossiers</Label>
                <Switch
                  id="showOnlyFolders"
                  checked={options.showOnlyFolders}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleMultipleOptionChanges({
                        showOnlyFolders: true,
                        showOnlyFiles: false,
                      });
                    } else {
                      handleOptionChange('showOnlyFolders', false);
                    }
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showFullPath">Afficher le chemin complet</Label>
                <Switch
                  id="showFullPath"
                  checked={options.showFullPath}
                  onCheckedChange={(checked) => handleOptionChange('showFullPath', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Visuel */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Visuel</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="showLineNumbers">Numérotation des lignes</Label>
                <Switch
                  id="showLineNumbers"
                  checked={options.showLineNumbers}
                  onCheckedChange={(checked) => handleOptionChange('showLineNumbers', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showSeparators">Lignes de séparation</Label>
                <Switch
                  id="showSeparators"
                  checked={options.showSeparators}
                  onCheckedChange={(checked) => handleOptionChange('showSeparators', checked)}
                />
              </div>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
