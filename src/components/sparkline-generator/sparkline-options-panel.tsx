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
import { SparklineOptions, ChartType, FillChar } from '@/lib/sparkline-types';
import { useTranslations } from 'next-intl';

interface SparklineOptionsPanelProps {
  options: SparklineOptions;
  onOptionsChange: (options: SparklineOptions) => void;
}

export function SparklineOptionsPanel({ options, onOptionsChange }: SparklineOptionsPanelProps) {
  const t = useTranslations('sparklineGenerator');

  const set = <K extends keyof SparklineOptions>(key: K, value: SparklineOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-sm mb-4">{t('options.title')}</h2>
      <div className="space-y-6 pb-6">

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chartType">{t('options.chartType')}</Label>
            <Select
              value={options.chartType}
              onValueChange={(v) => set('chartType', v as ChartType)}
            >
              <SelectTrigger id="chartType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sparkline">{t('options.typeSpark')}</SelectItem>
                <SelectItem value="barChart">{t('options.typeBar')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {options.chartType === 'barChart' && (
          <>
            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="barHeight">{t('options.barHeight')}</Label>
                <Select
                  value={String(options.barHeight)}
                  onValueChange={(v) => set('barHeight', Number(v))}
                >
                  <SelectTrigger id="barHeight" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[4, 6, 8, 10, 12, 16].map((h) => (
                      <SelectItem key={h} value={String(h)}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fillChar">{t('options.fillChar')}</Label>
                <Select
                  value={options.fillChar}
                  onValueChange={(v) => set('fillChar', v as FillChar)}
                >
                  <SelectTrigger id="fillChar" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="█">{t('options.fillBlock')}</SelectItem>
                    <SelectItem value="▓">{t('options.fillShade')}</SelectItem>
                    <SelectItem value="#">{t('options.fillHash')}</SelectItem>
                    <SelectItem value="|">{t('options.fillPipe')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="showValues">{t('options.showValues')}</Label>
                <Switch
                  id="showValues"
                  checked={options.showValues}
                  onCheckedChange={(v) => set('showValues', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="barSpacing">{t('options.barSpacing')}</Label>
                <Switch
                  id="barSpacing"
                  checked={options.barSpacing}
                  onCheckedChange={(v) => set('barSpacing', v)}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
