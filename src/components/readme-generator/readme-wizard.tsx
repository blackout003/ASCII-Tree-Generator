'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { localeNames, locales } from '@/i18n/locales';
import { META_LIMITS } from '@/lib/readme/defaults';
import type { ExtractedKey, ExtractedMeta } from '@/lib/readme/extract';
import { getCatalog, getRecommendedTypes } from '@/lib/readme/registry';
import type { BlockType, ReadmeLanguage, ReadmeMode, ReadmeState } from '@/lib/readme/types';
import { cn } from '@/lib/utils';
import { ExtractionPanel } from './extraction-panel';

const STEP_COUNT = 5;
const STEP_KEYS = ['stepMode', 'stepStart', 'stepInfos', 'stepSections', 'stepStyle'] as const;
const ACCENT_PRESETS = ['0969da', '1a7f37', '8250df', 'bf3989', 'd1242f', '9a6700'];
const MODES: ReadmeMode[] = ['project', 'profile'];
const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ' +
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

type MetaField = 'name' | 'description' | 'author' | 'license' | 'repoUrl' | 'installCommand';
const PROJECT_FIELDS: MetaField[] = ['name', 'description', 'author', 'license', 'repoUrl', 'installCommand'];
const PROFILE_FIELDS: MetaField[] = ['name', 'description'];

interface ReadmeWizardProps {
  state: ReadmeState;
  /** True for a first README: its blocks are created when the wizard ends. */
  isNew: boolean;
  onMetaChange: (patch: Partial<ReadmeState['meta']>) => void;
  onAccentChange: (color: string) => void;
  onExtracted: (extracted: ExtractedMeta) => ExtractedKey[];
  /** The chosen mode and sections are only applied here, when the wizard ends. */
  onFinish: (choice: { mode: ReadmeMode; selected: BlockType[] }) => void;
}

export function ReadmeWizard({
  state,
  isNew,
  onMetaChange,
  onAccentChange,
  onExtracted,
  onFinish,
}: ReadmeWizardProps) {
  const t = useTranslations('readmeGenerator');
  const [step, setStep] = useState(1);
  const [showPrefill, setShowPrefill] = useState(false);
  const [filled, setFilled] = useState<ExtractedKey[]>([]);
  const [selected, setSelected] = useState<Set<BlockType>>(
    () => new Set(isNew ? getRecommendedTypes(state.mode) : state.blocks.map((block) => block.type))
  );
  const [accentDraft, setAccentDraft] = useState(state.theme.accentColor);
  // The mode stays local until the end: switching it in the README right away would
  // drop the user's blocks, and clicking back would only recreate empty ones.
  const [mode, setMode] = useState<ReadmeMode>(state.mode);
  const catalog = getCatalog(mode);
  const fields = mode === 'project' ? PROJECT_FIELDS : PROFILE_FIELDS;
  const accentValid = /^#?[0-9a-fA-F]{6}$/.test(accentDraft.trim());

  const chooseMode = (next: ReadmeMode) => {
    setMode(next);
    const allowed = new Set(getCatalog(next).map((def) => def.type));
    setSelected(
      isNew
        ? new Set(getRecommendedTypes(next))
        : new Set(state.blocks.map((block) => block.type).filter((type) => allowed.has(type)))
    );
  };

  const toggle = (type: BlockType) =>
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });

  const handleExtracted = (extracted: ExtractedMeta) => {
    const keys = onExtracted(extracted);
    setFilled((previous) => [...new Set([...previous, ...keys])]);
    return keys;
  };

  const finish = () => onFinish({ mode, selected: [...selected] });

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {t('wizard.title')} · {t('wizard.step', { current: step, total: STEP_COUNT })}
          </p>
          <CardTitle>{t(`wizard.${STEP_KEYS[step - 1]}`)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('wizard.modeHint')}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {MODES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={mode === option}
                    onClick={() => chooseMode(option)}
                    className={cn(
                      'rounded-md border p-4 text-left transition-colors',
                      mode === option ? 'border-primary bg-primary/5' : 'hover:bg-muted'
                    )}
                  >
                    <span className="block font-medium">{t(`modes.${option}`)}</span>
                    <span className="mt-1 block text-sm text-muted-foreground">{t(`modes.${option}Desc`)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setShowPrefill(false);
                  setStep(3);
                }}
                className="w-full rounded-md border border-primary bg-primary/5 p-4 text-left"
              >
                <span className="block font-medium">{t('wizard.scratch')}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{t('wizard.scratchDesc')}</span>
              </button>
              <button
                type="button"
                aria-expanded={showPrefill}
                onClick={() => setShowPrefill((open) => !open)}
                className="w-full rounded-md border p-4 text-left hover:bg-muted"
              >
                <span className="block font-medium">{t('wizard.prefill')}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{t('wizard.prefillDesc')}</span>
              </button>
              {showPrefill && <ExtractionPanel onExtracted={handleExtracted} />}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('wizard.infosHint')}</p>
              {fields.map((field) => (
                <div key={field} className="space-y-1">
                  <Label htmlFor={`wizard-${field}`}>
                    {t(`meta.${field}`)}
                    {filled.includes(field) && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">({t('meta.autoFilled')})</span>
                    )}
                  </Label>
                  <Input
                    id={`wizard-${field}`}
                    value={state.meta[field]}
                    maxLength={META_LIMITS[field]}
                    placeholder={field === 'name' ? t('placeholders.title') : field === 'repoUrl' ? t('placeholders.repoUrl') : undefined}
                    onChange={(e) => onMetaChange({ [field]: e.target.value })}
                  />
                </div>
              ))}
              <div className="space-y-1">
                <Label htmlFor="wizard-language">{t('meta.language')}</Label>
                <select
                  id="wizard-language"
                  className={SELECT_CLASS}
                  value={state.meta.language}
                  onChange={(e) => onMetaChange({ language: e.target.value as ReadmeLanguage })}
                >
                  {locales.map((locale) => (
                    <option key={locale} value={locale}>
                      {localeNames[locale]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{t('wizard.sectionsHint')}</p>
              <ul className="space-y-2">
                {catalog.map((def) => (
                  <li key={def.type}>
                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={selected.has(def.type)}
                        onChange={() => toggle(def.type)}
                      />
                      <span>{t(`blocks.${def.type}`)}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('wizard.styleHint')}</p>
              <div className="space-y-2">
                <Label>{t('wizard.accent')}</Label>
                <div className="flex flex-wrap gap-2">
                  {ACCENT_PRESETS.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      aria-label={`#${hex}`}
                      aria-pressed={state.theme.accentColor === hex}
                      onClick={() => {
                        setAccentDraft(hex);
                        onAccentChange(hex);
                      }}
                      className={cn(
                        'h-8 w-8 rounded-full border',
                        state.theme.accentColor === hex && 'ring-2 ring-primary ring-offset-2'
                      )}
                      style={{ backgroundColor: `#${hex}` }}
                    />
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="wizard-accent">{t('wizard.accentCustom')}</Label>
                <Input
                  id="wizard-accent"
                  value={accentDraft}
                  maxLength={7}
                  aria-invalid={accentDraft.trim() !== '' && !accentValid}
                  onChange={(e) => {
                    setAccentDraft(e.target.value);
                    onAccentChange(e.target.value);
                  }}
                />
                {accentDraft.trim() !== '' && !accentValid && (
                  <p className="text-xs text-destructive">{t('wizard.accentInvalid')}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={finish}>
          {t('wizard.skip')}
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" disabled={step === 1} onClick={() => setStep((s) => s - 1)}>
            {t('wizard.back')}
          </Button>
          {step < STEP_COUNT ? (
            <Button type="button" size="sm" onClick={() => setStep((s) => s + 1)}>
              {t('wizard.next')}
            </Button>
          ) : (
            <Button type="button" size="sm" onClick={finish}>
              {t('wizard.finish')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
