'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ConnectorStyle } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface TreeCommandsOptionsPanelProps {
  connectorStyle: ConnectorStyle;
  onConnectorStyleChange: (style: ConnectorStyle) => void;
}

export function TreeCommandsOptionsPanel({
  connectorStyle,
  onConnectorStyleChange,
}: TreeCommandsOptionsPanelProps) {
  const t = useTranslations('treeCommandsGenerator');

  return (
    <div className="p-4">
      <h2 className="font-semibold text-sm mb-4">{t('options.title')}</h2>
      <div className="space-y-2">
        <Label htmlFor="connectorStyle">{t('options.connectorStyle')}</Label>
        <Select value={connectorStyle} onValueChange={(v) => onConnectorStyleChange(v as ConnectorStyle)}>
          <SelectTrigger id="connectorStyle" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unicode">{t('options.styleUnicode')}</SelectItem>
            <SelectItem value="ascii">{t('options.styleAscii')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
