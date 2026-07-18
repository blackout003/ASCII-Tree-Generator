'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BannerOptions, FontName, BannerAlign } from '@/lib/banner-types';
import { useTranslations } from 'next-intl';

interface BannerOptionsPanelProps {
  options: BannerOptions;
  onOptionsChange: (options: BannerOptions) => void;
}

export function BannerOptionsPanel({ options, onOptionsChange }: BannerOptionsPanelProps) {
  const t = useTranslations('bannerGenerator');

  const set = <K extends keyof BannerOptions>(key: K, value: BannerOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-sm mb-4">{t('options.title')}</h2>
      <div className="space-y-6 pb-6">

        <div className="space-y-4">
          <h3 className="font-semibold text-sm">{t('options.styleSection')}</h3>

          <div className="space-y-2">
            <Label htmlFor="font">{t('options.font')}</Label>
            <Select
              value={options.font}
              onValueChange={(v) => set('font', v as FontName)}
            >
              <SelectTrigger id="font" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">{t('options.fontStandard')}</SelectItem>
                <SelectItem value="big">{t('options.fontBig')}</SelectItem>
                <SelectItem value="small">{t('options.fontSmall')}</SelectItem>
                <SelectItem value="mini">{t('options.fontMini')}</SelectItem>
                <SelectItem value="slant">{t('options.fontSlant')}</SelectItem>
                <SelectItem value="lean">{t('options.fontLean')}</SelectItem>
                <SelectItem value="block">{t('options.fontBlock')}</SelectItem>
                <SelectItem value="digital">{t('options.fontDigital')}</SelectItem>
                <SelectItem value="doom">{t('options.fontDoom')}</SelectItem>
                <SelectItem value="shadow">{t('options.fontShadow')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="font-semibold text-sm">{t('options.layoutSection')}</h3>

          <div className="space-y-2">
            <Label htmlFor="align">{t('options.align')}</Label>
            <Select
              value={options.align}
              onValueChange={(v) => set('align', v as BannerAlign)}
            >
              <SelectTrigger id="align" className="w-full">
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
            <Label htmlFor="spacing">{t('options.spacing')}</Label>
            <Select
              value={String(options.spacing)}
              onValueChange={(v) => set('spacing', Number(v))}
            >
              <SelectTrigger id="spacing" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">0</SelectItem>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>
    </div>
  );
}
