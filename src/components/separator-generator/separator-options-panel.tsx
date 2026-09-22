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
import {
  SeparatorOptions,
  BlockType,
  BadgeStyle,
  CommentLang,
  LINE_CHARS,
  WIDTH_OPTIONS,
} from '@/lib/separator-types';
import { useTranslations } from 'next-intl';

interface SeparatorOptionsPanelProps {
  options: SeparatorOptions;
  onOptionsChange: (options: SeparatorOptions) => void;
}

export function SeparatorOptionsPanel({ options, onOptionsChange }: SeparatorOptionsPanelProps) {
  const t = useTranslations('separatorGenerator');

  const set = <K extends keyof SeparatorOptions>(key: K, value: SeparatorOptions[K]) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="p-4">
      <h2 className="font-semibold text-sm mb-4">{t('options.title')}</h2>
      <div className="space-y-6 pb-6">
        <div className="space-y-2">
          <Label htmlFor="blockType">{t('options.blockType')}</Label>
          <Select value={options.blockType} onValueChange={(v) => set('blockType', v as BlockType)}>
            <SelectTrigger id="blockType" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">{t('options.typeLine')}</SelectItem>
              <SelectItem value="badge">{t('options.typeBadge')}</SelectItem>
              <SelectItem value="comment">{t('options.typeComment')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {options.blockType === 'line' && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lineChar">{t('options.lineChar')}</Label>
                <Select value={options.lineChar} onValueChange={(v) => set('lineChar', v)}>
                  <SelectTrigger id="lineChar" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LINE_CHARS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c.repeat(6)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="width">{t('options.width')}</Label>
                <Select value={String(options.width)} onValueChange={(v) => set('width', Number(v))}>
                  <SelectTrigger id="width" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WIDTH_OPTIONS.map((w) => (
                      <SelectItem key={w} value={String(w)}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}

        {options.blockType === 'badge' && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="badgeStyle">{t('options.badgeStyle')}</Label>
              <Select value={options.badgeStyle} onValueChange={(v) => set('badgeStyle', v as BadgeStyle)}>
                <SelectTrigger id="badgeStyle" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brackets">{t('options.badgeBrackets')}</SelectItem>
                  <SelectItem value="dashes">{t('options.badgeDashes')}</SelectItem>
                  <SelectItem value="block">{t('options.badgeBlock')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {options.blockType === 'comment' && (
          <>
            <Separator />
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="commentLang">{t('options.commentLang')}</Label>
                <Select value={options.commentLang} onValueChange={(v) => set('commentLang', v as CommentLang)}>
                  <SelectTrigger id="commentLang" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="c">{t('options.commentC')}</SelectItem>
                    <SelectItem value="hash">{t('options.commentHash')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commentWidth">{t('options.width')}</Label>
                <Select value={String(options.width)} onValueChange={(v) => set('width', Number(v))}>
                  <SelectTrigger id="commentWidth" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WIDTH_OPTIONS.map((w) => (
                      <SelectItem key={w} value={String(w)}>
                        {w}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
