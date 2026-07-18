'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Save, Upload, Trash2 } from '@/components/icons';
import { useTranslations } from 'next-intl';

interface TreeControlsProps {
  onAddFolder: () => void;
  onAddFile: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onLoadFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Composant pour les contrôles de l'arbre (ajouter, sauvegarder, charger, effacer)
 */
export function TreeControls({
  onAddFolder,
  onAddFile,
  onSave,
  onLoad,
  onClear,
  onLoadFileChange,
}: TreeControlsProps) {
  const t = useTranslations();

  return (
    <div className="mb-4 flex gap-2 flex-wrap">
      <div className="flex gap-2">
        <Button onClick={onAddFolder} size="sm">
          <Plus className="w-4 h-4 mr-1" />
          {t('treeEditor.newFolder')}
        </Button>
        <Button onClick={onAddFile} size="sm" variant="outline">
          <Plus className="w-4 h-4 mr-1" />
          {t('treeEditor.newFile')}
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={onSave} size="sm" variant="outline">
          <Save className="w-4 h-4 mr-1" />
          {t('treeEditor.save')}
        </Button>
        <Button 
          onClick={onLoad} 
          size="sm" 
          variant="outline"
        >
          <Upload className="w-4 h-4 mr-1" />
          {t('treeEditor.load')}
        </Button>
      </div>
      
      <Button onClick={onClear} size="sm" variant="destructive">
        <Trash2 className="w-4 h-4 mr-1" />
        {t('treeEditor.clearAll')}
      </Button>
      
      <input
        id="load-tree-input"
        type="file"
        accept=".json"
        onChange={onLoadFileChange}
        className="hidden"
      />
    </div>
  );
}
