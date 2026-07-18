'use client';

import React from 'react';
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
import { TableOptions, BorderStyle, Alignment } from '@/lib/table-types';
import { useTranslations } from 'next-intl';

interface TableOptionsPanelProps {
  options: TableOptions;
  onOptionsChange: (options: TableOptions) => void;
}

export function TableOptionsPanel({ options, onOptionsChange }: TableOptionsPanelProps) {
  const t = useTranslations('tableGenerator');

  const set = <K extends keyof TableOptions>(key: K, value: TableOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-sm mb-4">{t('options.title')}</h2>
      <div className="space-y-6 pb-6">

        <div className="space-y-4">
          <h3 className="font-semibold text-sm">{t('options.styleSection')}</h3>

          <div className="space-y-2">
            <Label htmlFor="borderStyle">{t('options.borderStyle')}</Label>
            <Select
              value={options.borderStyle}
              onValueChange={(v) => set('borderStyle', v as BorderStyle)}
            >
              <SelectTrigger id="borderStyle" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unicode">Unicode (┌─┬─┐)</SelectItem>
                <SelectItem value="ascii">ASCII (+-+-+)</SelectItem>
                <SelectItem value="markdown">Markdown (| --- |)</SelectItem>
                <SelectItem value="simple">{t('options.styleSimple')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="alignment">{t('options.alignment')}</Label>
            <Select
              value={options.alignment}
              onValueChange={(v) => set('alignment', v as Alignment)}
            >
              <SelectTrigger id="alignment" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">{t('options.alignLeft')}</SelectItem>
                <SelectItem value="center">{t('options.alignCenter')}</SelectItem>
                <SelectItem value="right">{t('options.alignRight')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="padding">{t('options.padding')}</Label>
            <Select
              value={String(options.padding)}
              onValueChange={(v) => set('padding', Number(v))}
            >
              <SelectTrigger id="padding" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-semibold text-sm">{t('options.displaySection')}</h3>

          <div className="flex items-center justify-between">
            <Label htmlFor="hasHeader">{t('options.hasHeader')}</Label>
            <Switch
              id="hasHeader"
              checked={options.hasHeader}
              onCheckedChange={(v) => set('hasHeader', v)}
            />
          </div>
        </div>

      </div>
    </div>
  );
}
