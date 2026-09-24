'use client';

import React, { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Copy, Download, Save, Trash2, Upload } from '@/components/icons';
import type { ReadmeMode } from '@/lib/readme/types';

const MODES: ReadmeMode[] = ['project', 'profile'];

interface ReadmeToolbarProps {
  mode: ReadmeMode;
  onModeChange: (mode: ReadmeMode) => void;
  onCopy: () => void;
  onDownload: () => void;
  onExportJson: () => void;
  onImportFile: (file: File) => void;
  onReset: () => void;
}

export function ReadmeToolbar({
  mode,
  onModeChange,
  onCopy,
  onDownload,
  onExportJson,
  onImportFile,
  onReset,
}: ReadmeToolbarProps) {
  const t = useTranslations('readmeGenerator');
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('toolbar.mode')}>
        {MODES.map((value) => (
          <Button
            key={value}
            size="sm"
            variant={mode === value ? 'default' : 'outline'}
            aria-pressed={mode === value}
            onClick={() => onModeChange(value)}
          >
            {t(`modes.${value}`)}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={onCopy}>
          <Copy className="w-4 h-4 mr-1" />
          {t('toolbar.copy')}
        </Button>
        <Button size="sm" variant="outline" onClick={onDownload}>
          <Download className="w-4 h-4 mr-1" />
          {t('toolbar.download')}
        </Button>
        <Button size="sm" variant="outline" onClick={onExportJson}>
          <Save className="w-4 h-4 mr-1" />
          {t('toolbar.exportJson')}
        </Button>
        <Button size="sm" variant="outline" onClick={() => fileInput.current?.click()}>
          <Upload className="w-4 h-4 mr-1" />
          {t('toolbar.importJson')}
        </Button>
        <Button size="sm" variant="outline" onClick={onReset}>
          <Trash2 className="w-4 h-4 mr-1" />
          {t('toolbar.reset')}
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportFile(file);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
