'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
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
import type { QrEcc, QrOptions, QrStyle } from '@/lib/qr-types';

interface QrOptionsPanelProps {
  options: QrOptions;
  onOptionsChange: (options: QrOptions) => void;
}

export function QrOptionsPanel({ options, onOptionsChange }: QrOptionsPanelProps) {
  const t = useTranslations('qrGenerator');

  const set = <K extends keyof QrOptions>(key: K, value: QrOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-sm mb-4">{t('options.title')}</h2>
      <div className="space-y-6 pb-6">
        <div className="space-y-2">
          <Label htmlFor="qrStyle">{t('options.style')}</Label>
          <Select value={options.style} onValueChange={(v) => set('style', v as QrStyle)}>
            <SelectTrigger id="qrStyle" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="half">{t('options.styleHalf')}</SelectItem>
              <SelectItem value="blocks">{t('options.styleBlocks')}</SelectItem>
              <SelectItem value="ascii">{t('options.styleAscii')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="qrEcc">{t('options.ecc')}</Label>
          <Select value={options.ecc} onValueChange={(v) => set('ecc', v as QrEcc)}>
            <SelectTrigger id="qrEcc" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">{t('options.eccL')}</SelectItem>
              <SelectItem value="M">{t('options.eccM')}</SelectItem>
              <SelectItem value="Q">{t('options.eccQ')}</SelectItem>
              <SelectItem value="H">{t('options.eccH')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="qrInvert">{t('options.invert')}</Label>
            <Switch
              id="qrInvert"
              checked={options.invert}
              onCheckedChange={(v) => set('invert', v)}
            />
          </div>
          <p className="text-xs text-muted-foreground">{t('options.invertHint')}</p>
        </div>

        <p className="text-xs text-muted-foreground">{t('options.quietZoneNote')}</p>
      </div>
    </div>
  );
}
