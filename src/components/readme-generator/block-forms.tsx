'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2 } from '@/components/icons';
import { ALERT_KINDS, ALERT_TEXT_MAX, type AlertData } from '@/lib/readme/blocks/alert';
import { ARCHITECTURE_LIMITS, type ArchitectureData } from '@/lib/readme/blocks/architecture';
import { BADGE_LIMITS, type BadgeItem, type BadgesData } from '@/lib/readme/blocks/badges';
import {
  BANNER_FONTS,
  BANNER_LIMITS,
  BANNER_SIZES,
  BANNER_WIDTHS,
  type BannerData,
} from '@/lib/readme/blocks/banner';
import { BIO_LIMITS, type BioData } from '@/lib/readme/blocks/bio';
import { BLOG_LIMITS, BLOG_MAX_POSTS, type BlogData } from '@/lib/readme/blocks/blog';
import {
  CONTACT_LIMITS,
  CONTACT_NETWORKS,
  CONTACT_NETWORK_KEYS,
  type ContactData,
  type ContactItem,
} from '@/lib/readme/blocks/contact';
import { CONTRIBUTING_LIMITS, type ContributingData } from '@/lib/readme/blocks/contributing';
import { FREE_MARKDOWN_MAX_LENGTH, type FreeMarkdownData } from '@/lib/readme/blocks/free-markdown';
import { HEADER_LIMITS, type HeaderData } from '@/lib/readme/blocks/header';
import {
  INSTALL_LIMITS,
  INSTALL_MANAGERS,
  type InstallManager,
  type InstallationData,
} from '@/lib/readme/blocks/installation';
import { LICENSE_LIMITS, type LicenseData } from '@/lib/readme/blocks/license';
import { SKILL_PER_LINE, SKILLS_LIMITS, type SkillsData } from '@/lib/readme/blocks/skills';
import { STATS_LAYOUTS, STATS_LIMITS, type StatsData } from '@/lib/readme/blocks/stats';
import { TOC_HEADING_MAX, type TocData } from '@/lib/readme/blocks/table-of-contents';
import { TROPHIES_LIMITS, TROPHY_COLUMNS, TROPHY_ROWS, type TrophiesData } from '@/lib/readme/blocks/trophies';
import { USAGE_LIMITS, type UsageData } from '@/lib/readme/blocks/usage';
import { VISUAL_PROOF_LIMITS, type VisualProofData } from '@/lib/readme/blocks/visual-proof';
import type { Block } from '@/lib/readme/types';
import { SKILL_GROUPS } from '@/lib/readme/skill-catalog';
import { cn } from '@/lib/utils';

const SELECT_CLASS =
  'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm ' +
  'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

const LICENSE_SUGGESTIONS = [
  'MIT', 'Apache-2.0', 'GPL-3.0', 'LGPL-3.0', 'AGPL-3.0', 'BSD-3-Clause', 'BSD-2-Clause',
  'MPL-2.0', 'ISC', 'Unlicense', 'CC0-1.0',
];

interface FormProps<T> {
  idPrefix: string;
  data: T;
  onChange: (data: T) => void;
}

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  max: number;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  list?: string;
}

function TextField({ id, label, value, max, onChange, placeholder, hint, list }: TextFieldProps) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        list={list}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

interface AreaFieldProps extends Omit<TextFieldProps, 'list'> {
  rows?: number;
  mono?: boolean;
}

function AreaField({ id, label, value, max, onChange, placeholder, hint, rows = 4, mono = false }: AreaFieldProps) {
  return (
    <Field id={id} label={label} hint={hint}>
      <Textarea
        id={id}
        rows={rows}
        value={value}
        maxLength={max}
        placeholder={placeholder}
        className={cn(mono && 'font-mono text-sm')}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function SelectField<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <Field id={id} label={label}>
      <select id={id} className={SELECT_CLASS} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

function NumberSelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  options: readonly number[];
  onChange: (value: number) => void;
}) {
  return (
    <SelectField
      id={id}
      label={label}
      value={String(value)}
      options={options.map((option) => ({ value: String(option), label: String(option) }))}
      onChange={(next) => onChange(Number(next))}
    />
  );
}

function CheckField({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-sm">
      <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/**
 * A hex color input that only reports values the schema accepts (empty or six
 * digits), so a half-typed color never reaches the state and never gets saved.
 */
function ColorField({ id, label, hint, value, onChange }: { id: string; label: string; hint: string; value: string; onChange: (value: string) => void }) {
  const [draft, setDraft] = useState(value);
  return (
    <Field id={id} label={label} hint={hint}>
      <Input
        id={id}
        value={draft}
        maxLength={6}
        placeholder="0969da"
        aria-invalid={draft.length !== 0 && draft.length !== 6}
        aria-describedby={`${id}-hint`}
        onChange={(e) => {
          const next = e.target.value.replace(/[^0-9a-fA-F]/g, '');
          setDraft(next);
          if (next.length === 0 || next.length === 6) onChange(next.toLowerCase());
        }}
      />
    </Field>
  );
}

function HeaderForm({ idPrefix, data, onChange }: FormProps<HeaderData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<HeaderData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-title`} label={t('fields.title')} value={data.title} max={HEADER_LIMITS.title} placeholder={t('placeholders.title')} onChange={(title) => set({ title })} />
      <TextField id={`${idPrefix}-tagline`} label={t('fields.tagline')} value={data.tagline} max={HEADER_LIMITS.tagline} placeholder={t('placeholders.tagline')} onChange={(tagline) => set({ tagline })} />
      <TextField id={`${idPrefix}-logoUrl`} label={t('fields.logoUrl')} value={data.logoUrl} max={HEADER_LIMITS.logoUrl} placeholder={t('placeholders.logoUrl')} onChange={(logoUrl) => set({ logoUrl })} />
      <TextField id={`${idPrefix}-logoAlt`} label={t('fields.logoAlt')} value={data.logoAlt} max={HEADER_LIMITS.logoAlt} placeholder={t('placeholders.logoAlt')} onChange={(logoAlt) => set({ logoAlt })} />
    </div>
  );
}

function BadgesForm({ idPrefix, data, onChange }: FormProps<BadgesData>) {
  const t = useTranslations('readmeGenerator');
  const setItem = (index: number, patch: Partial<BadgeItem>) =>
    onChange({ items: data.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) });
  return (
    <div className="space-y-4">
      {data.items.map((item, index) => (
        <div key={index} className="space-y-3 rounded-md border p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField id={`${idPrefix}-${index}-label`} label={t('fields.badgeLabel')} value={item.label} max={BADGE_LIMITS.label} onChange={(label) => setItem(index, { label })} />
            <TextField id={`${idPrefix}-${index}-message`} label={t('fields.badgeMessage')} value={item.message} max={BADGE_LIMITS.message} onChange={(message) => setItem(index, { message })} />
            <ColorField id={`${idPrefix}-${index}-color`} label={t('fields.badgeColor')} hint={t('hints.badgeColor')} value={item.color} onChange={(color) => setItem(index, { color })} />
            <TextField id={`${idPrefix}-${index}-link`} label={t('fields.badgeLink')} value={item.link} max={BADGE_LIMITS.link} onChange={(link) => setItem(index, { link })} />
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange({ items: data.items.filter((_, i) => i !== index) })}>
            <Trash2 className="w-4 h-4 mr-1" />
            {t('fields.removeBadge')}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={data.items.length >= BADGE_LIMITS.maxItems}
        onClick={() => onChange({ items: [...data.items, { label: '', message: '', color: '', link: '' }] })}
      >
        <Plus className="w-4 h-4 mr-1" />
        {t('fields.addBadge')}
      </Button>
    </div>
  );
}

function VisualProofForm({ idPrefix, data, onChange }: FormProps<VisualProofData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<VisualProofData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-url`} label={t('fields.url')} value={data.url} max={VISUAL_PROOF_LIMITS.url} placeholder={t('placeholders.logoUrl')} onChange={(url) => set({ url })} />
      <TextField id={`${idPrefix}-alt`} label={t('fields.alt')} value={data.alt} max={VISUAL_PROOF_LIMITS.alt} onChange={(alt) => set({ alt })} />
      <TextField id={`${idPrefix}-caption`} label={t('fields.caption')} value={data.caption} max={VISUAL_PROOF_LIMITS.caption} onChange={(caption) => set({ caption })} />
    </div>
  );
}

function TocForm({ idPrefix, data, onChange }: FormProps<TocData>) {
  const t = useTranslations('readmeGenerator');
  return <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={TOC_HEADING_MAX} onChange={(heading) => onChange({ heading })} />;
}

function InstallationForm({ idPrefix, data, onChange }: FormProps<InstallationData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<InstallationData>) => onChange({ ...data, ...patch });
  const managers = INSTALL_MANAGERS.map((manager) => ({ value: manager, label: manager === 'none' ? '—' : manager }));
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={INSTALL_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <AreaField id={`${idPrefix}-prerequisites`} label={t('fields.prerequisites')} hint={t('hints.prerequisites')} value={data.prerequisites} max={INSTALL_LIMITS.prerequisites} rows={3} onChange={(prerequisites) => set({ prerequisites })} />
      <SelectField<InstallManager> id={`${idPrefix}-manager`} label={t('fields.packageManager')} value={data.manager} options={managers} onChange={(manager) => set({ manager })} />
      <TextField id={`${idPrefix}-packageName`} label={t('fields.packageName')} value={data.packageName} max={INSTALL_LIMITS.packageName} placeholder={t('placeholders.packageName')} onChange={(packageName) => set({ packageName })} />
      <AreaField id={`${idPrefix}-commands`} label={t('fields.commands')} hint={t('hints.commands')} value={data.commands} max={INSTALL_LIMITS.commands} rows={3} mono onChange={(commands) => set({ commands })} />
    </div>
  );
}

function UsageForm({ idPrefix, data, onChange }: FormProps<UsageData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<UsageData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={USAGE_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <AreaField id={`${idPrefix}-description`} label={t('fields.description')} value={data.description} max={USAGE_LIMITS.description} rows={3} onChange={(description) => set({ description })} />
      <AreaField id={`${idPrefix}-code`} label={t('fields.code')} value={data.code} max={USAGE_LIMITS.code} rows={6} mono onChange={(code) => set({ code })} />
      <TextField id={`${idPrefix}-language`} label={t('fields.codeLanguage')} value={data.language} max={USAGE_LIMITS.language} placeholder="js" onChange={(language) => set({ language })} />
    </div>
  );
}

function ArchitectureForm({ idPrefix, data, onChange }: FormProps<ArchitectureData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<ArchitectureData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={ARCHITECTURE_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <AreaField id={`${idPrefix}-content`} label={t('fields.architecture')} value={data.content} max={ARCHITECTURE_LIMITS.content} rows={5} onChange={(content) => set({ content })} />
      <TextField id={`${idPrefix}-roadmapHeading`} label={t('fields.roadmapHeading')} value={data.roadmapHeading} max={ARCHITECTURE_LIMITS.roadmapHeading} onChange={(roadmapHeading) => set({ roadmapHeading })} />
      <AreaField id={`${idPrefix}-roadmap`} label={t('fields.roadmap')} hint={t('hints.roadmap')} value={data.roadmap} max={ARCHITECTURE_LIMITS.roadmap} rows={4} onChange={(roadmap) => set({ roadmap })} />
    </div>
  );
}

function ContributingForm({ idPrefix, data, onChange }: FormProps<ContributingData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<ContributingData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={CONTRIBUTING_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <AreaField id={`${idPrefix}-text`} label={t('fields.text')} value={data.text} max={CONTRIBUTING_LIMITS.text} rows={4} onChange={(text) => set({ text })} />
      <TextField id={`${idPrefix}-linkUrl`} label={t('fields.linkUrl')} value={data.linkUrl} max={CONTRIBUTING_LIMITS.linkUrl} onChange={(linkUrl) => set({ linkUrl })} />
      <TextField id={`${idPrefix}-linkLabel`} label={t('fields.linkLabel')} value={data.linkLabel} max={CONTRIBUTING_LIMITS.linkLabel} onChange={(linkLabel) => set({ linkLabel })} />
    </div>
  );
}

function LicenseForm({ idPrefix, data, onChange }: FormProps<LicenseData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<LicenseData>) => onChange({ ...data, ...patch });
  const listId = `${idPrefix}-license-list`;
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={LICENSE_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <TextField id={`${idPrefix}-license`} label={t('fields.license')} value={data.license} max={LICENSE_LIMITS.license} list={listId} onChange={(license) => set({ license })} />
      <datalist id={listId}>
        {LICENSE_SUGGESTIONS.map((suggestion) => (
          <option key={suggestion} value={suggestion} />
        ))}
      </datalist>
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField id={`${idPrefix}-holder`} label={t('fields.holder')} value={data.holder} max={LICENSE_LIMITS.holder} onChange={(holder) => set({ holder })} />
        <TextField id={`${idPrefix}-year`} label={t('fields.year')} value={data.year} max={LICENSE_LIMITS.year} placeholder={String(new Date().getFullYear())} onChange={(year) => set({ year })} />
      </div>
      <AreaField id={`${idPrefix}-credits`} label={t('fields.credits')} hint={t('hints.credits')} value={data.credits} max={LICENSE_LIMITS.credits} rows={3} onChange={(credits) => set({ credits })} />
    </div>
  );
}

function AlertForm({ idPrefix, data, onChange }: FormProps<AlertData>) {
  const t = useTranslations('readmeGenerator');
  const kinds = ALERT_KINDS.map((kind) => ({ value: kind, label: kind }));
  return (
    <div className="space-y-3">
      <SelectField id={`${idPrefix}-kind`} label={t('fields.alertType')} value={data.kind} options={kinds} onChange={(kind) => onChange({ ...data, kind })} />
      <AreaField id={`${idPrefix}-text`} label={t('fields.text')} value={data.text} max={ALERT_TEXT_MAX} rows={3} onChange={(text) => onChange({ ...data, text })} />
    </div>
  );
}

function FreeMarkdownForm({ idPrefix, data, onChange }: FormProps<FreeMarkdownData>) {
  const t = useTranslations('readmeGenerator');
  return (
    <AreaField
      id={`${idPrefix}-content`}
      label={t('fields.content')}
      value={data.content}
      max={FREE_MARKDOWN_MAX_LENGTH}
      rows={10}
      mono
      placeholder={t('placeholders.content')}
      onChange={(content) => onChange({ content })}
    />
  );
}

function BannerForm({ idPrefix, data, onChange }: FormProps<BannerData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<BannerData>) => onChange({ ...data, ...patch });
  const fonts = BANNER_FONTS.map((font) => ({ value: font, label: font }));
  const aligns = [
    { value: 'left' as const, label: t('options.left') },
    { value: 'center' as const, label: t('options.center') },
  ];
  return (
    <div className="space-y-3">
      <AreaField id={`${idPrefix}-lines`} label={t('fields.lines')} hint={t('hints.lines')} value={data.lines} max={BANNER_LIMITS.lines} rows={3} onChange={(lines) => set({ lines })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField id={`${idPrefix}-font`} label={t('fields.font')} value={data.font} options={fonts} onChange={(font) => set({ font })} />
        <NumberSelectField id={`${idPrefix}-size`} label={t('fields.size')} value={data.size} options={BANNER_SIZES} onChange={(size) => set({ size })} />
        <NumberSelectField id={`${idPrefix}-width`} label={t('fields.width')} value={data.width} options={BANNER_WIDTHS} onChange={(width) => set({ width })} />
        <SelectField id={`${idPrefix}-align`} label={t('fields.align')} value={data.align} options={aligns} onChange={(align) => set({ align })} />
      </div>
      <ColorField id={`${idPrefix}-color`} label={t('fields.color')} hint={t('hints.badgeColor')} value={data.color} onChange={(color) => set({ color })} />
    </div>
  );
}

function BioForm({ idPrefix, data, onChange }: FormProps<BioData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<BioData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={BIO_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <AreaField id={`${idPrefix}-intro`} label={t('fields.intro')} value={data.intro} max={BIO_LIMITS.intro} rows={3} onChange={(intro) => set({ intro })} />
      <AreaField id={`${idPrefix}-points`} label={t('fields.points')} hint={t('hints.points')} value={data.points} max={BIO_LIMITS.points} rows={4} onChange={(points) => set({ points })} />
    </div>
  );
}

function SkillsForm({ idPrefix, data, onChange }: FormProps<SkillsData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<SkillsData>) => onChange({ ...data, ...patch });
  const themes = [
    { value: 'auto' as const, label: t('options.auto') },
    { value: 'light' as const, label: t('options.light') },
    { value: 'dark' as const, label: t('options.dark') },
  ];
  const full = data.icons.length >= SKILLS_LIMITS.maxIcons;
  const toggle = (id: string) =>
    set({ icons: data.icons.includes(id) ? data.icons.filter((icon) => icon !== id) : [...data.icons, id] });
  return (
    <div className="space-y-4">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={SKILLS_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <SelectField id={`${idPrefix}-theme`} label={t('fields.iconTheme')} value={data.theme} options={themes} onChange={(theme) => set({ theme })} />
        <NumberSelectField id={`${idPrefix}-perLine`} label={t('fields.perLine')} value={data.perLine} options={SKILL_PER_LINE} onChange={(perLine) => set({ perLine })} />
      </div>
      <p className="text-sm font-medium">{t('fields.skills')}</p>
      {SKILL_GROUPS.map((group) => (
        <fieldset key={group.key} className="space-y-2">
          <legend className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t(`skillGroups.${group.key}`)}</legend>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 sm:grid-cols-3">
            {group.skills.map((skill) => {
              const checked = data.icons.includes(skill.id);
              return (
                <label key={skill.id} className={cn('flex items-center gap-2 text-sm', !checked && full ? 'opacity-50' : 'cursor-pointer')}>
                  <input type="checkbox" checked={checked} disabled={!checked && full} onChange={() => toggle(skill.id)} />
                  {skill.label}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

function StatsForm({ idPrefix, data, onChange }: FormProps<StatsData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<StatsData>) => onChange({ ...data, ...patch });
  const layouts = STATS_LAYOUTS.map((layout) => ({ value: layout, label: layout }));
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={STATS_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <TextField id={`${idPrefix}-username`} label={t('fields.username')} value={data.username} max={STATS_LIMITS.username} placeholder={t('placeholders.username')} onChange={(username) => set({ username })} />
      <TextField id={`${idPrefix}-baseUrl`} label={t('fields.baseUrl')} hint={t('hints.baseUrl')} value={data.baseUrl} max={STATS_LIMITS.baseUrl} placeholder={t('placeholders.baseUrl')} onChange={(baseUrl) => set({ baseUrl })} />
      <CheckField id={`${idPrefix}-showStats`} label={t('fields.showStats')} checked={data.showStats} onChange={(showStats) => set({ showStats })} />
      <CheckField id={`${idPrefix}-showLanguages`} label={t('fields.showLanguages')} checked={data.showLanguages} onChange={(showLanguages) => set({ showLanguages })} />
      <SelectField id={`${idPrefix}-layout`} label={t('fields.layout')} value={data.layout} options={layouts} onChange={(layout) => set({ layout })} />
      <CheckField id={`${idPrefix}-hideBorder`} label={t('fields.hideBorder')} checked={data.hideBorder} onChange={(hideBorder) => set({ hideBorder })} />
    </div>
  );
}

function TrophiesForm({ idPrefix, data, onChange }: FormProps<TrophiesData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<TrophiesData>) => onChange({ ...data, ...patch });
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={TROPHIES_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <TextField id={`${idPrefix}-username`} label={t('fields.username')} value={data.username} max={TROPHIES_LIMITS.username} placeholder={t('placeholders.username')} onChange={(username) => set({ username })} />
      <TextField id={`${idPrefix}-baseUrl`} label={t('fields.baseUrl')} hint={t('hints.baseUrl')} value={data.baseUrl} max={TROPHIES_LIMITS.baseUrl} placeholder={t('placeholders.baseUrl')} onChange={(baseUrl) => set({ baseUrl })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberSelectField id={`${idPrefix}-columns`} label={t('fields.columns')} value={data.columns} options={TROPHY_COLUMNS} onChange={(columns) => set({ columns })} />
        <NumberSelectField id={`${idPrefix}-rows`} label={t('fields.rows')} value={data.rows} options={TROPHY_ROWS} onChange={(rows) => set({ rows })} />
      </div>
    </div>
  );
}

function BlogForm({ idPrefix, data, onChange }: FormProps<BlogData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<BlogData>) => onChange({ ...data, ...patch });
  const schedules = [
    { value: 'daily' as const, label: t('options.daily') },
    { value: 'weekly' as const, label: t('options.weekly') },
  ];
  return (
    <div className="space-y-3">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={BLOG_LIMITS.heading} onChange={(heading) => set({ heading })} />
      <TextField id={`${idPrefix}-feedUrl`} label={t('fields.feedUrl')} hint={t('hints.feedUrl')} value={data.feedUrl} max={BLOG_LIMITS.feedUrl} placeholder={t('placeholders.feedUrl')} onChange={(feedUrl) => set({ feedUrl })} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberSelectField id={`${idPrefix}-maxPosts`} label={t('fields.maxPosts')} value={data.maxPosts} options={BLOG_MAX_POSTS} onChange={(maxPosts) => set({ maxPosts })} />
        <SelectField id={`${idPrefix}-schedule`} label={t('fields.schedule')} value={data.schedule} options={schedules} onChange={(schedule) => set({ schedule })} />
      </div>
    </div>
  );
}

function ContactForm({ idPrefix, data, onChange }: FormProps<ContactData>) {
  const t = useTranslations('readmeGenerator');
  const networks = CONTACT_NETWORK_KEYS.map((key) => ({ value: key, label: CONTACT_NETWORKS[key].label }));
  const setItem = (index: number, patch: Partial<ContactItem>) =>
    onChange({ ...data, items: data.items.map((item, i) => (i === index ? { ...item, ...patch } : item)) });
  return (
    <div className="space-y-4">
      <TextField id={`${idPrefix}-heading`} label={t('fields.heading')} value={data.heading} max={CONTACT_LIMITS.heading} onChange={(heading) => onChange({ ...data, heading })} />
      {data.items.map((item, index) => (
        <div key={index} className="space-y-3 rounded-md border p-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <SelectField id={`${idPrefix}-${index}-network`} label={t('fields.network')} value={item.network} options={networks} onChange={(network) => setItem(index, { network })} />
            <TextField id={`${idPrefix}-${index}-value`} label={t('fields.value')} hint={index === 0 ? t('hints.contactValue') : undefined} value={item.value} max={CONTACT_LIMITS.value} onChange={(value) => setItem(index, { value })} />
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange({ ...data, items: data.items.filter((_, i) => i !== index) })}>
            <Trash2 className="w-4 h-4 mr-1" />
            {t('fields.removeContact')}
          </Button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={data.items.length >= CONTACT_LIMITS.maxItems}
        onClick={() => onChange({ ...data, items: [...data.items, { network: 'linkedin', value: '' }] })}
      >
        <Plus className="w-4 h-4 mr-1" />
        {t('fields.addContact')}
      </Button>
    </div>
  );
}

interface BlockFormProps {
  block: Block;
  onChange: (data: unknown) => void;
}

/** Picks the form for a block type. Add one case per new block type. */
export function BlockForm({ block, onChange }: BlockFormProps) {
  const common = { idPrefix: block.id, onChange };
  switch (block.type) {
    case 'header':
      return <HeaderForm {...common} data={block.data as HeaderData} />;
    case 'badges':
      return <BadgesForm {...common} data={block.data as BadgesData} />;
    case 'visualProof':
      return <VisualProofForm {...common} data={block.data as VisualProofData} />;
    case 'tableOfContents':
      return <TocForm {...common} data={block.data as TocData} />;
    case 'installation':
      return <InstallationForm {...common} data={block.data as InstallationData} />;
    case 'usage':
      return <UsageForm {...common} data={block.data as UsageData} />;
    case 'architecture':
      return <ArchitectureForm {...common} data={block.data as ArchitectureData} />;
    case 'contributing':
      return <ContributingForm {...common} data={block.data as ContributingData} />;
    case 'license':
      return <LicenseForm {...common} data={block.data as LicenseData} />;
    case 'alert':
      return <AlertForm {...common} data={block.data as AlertData} />;
    case 'banner':
      return <BannerForm {...common} data={block.data as BannerData} />;
    case 'bio':
      return <BioForm {...common} data={block.data as BioData} />;
    case 'skills':
      return <SkillsForm {...common} data={block.data as SkillsData} />;
    case 'stats':
      return <StatsForm {...common} data={block.data as StatsData} />;
    case 'trophies':
      return <TrophiesForm {...common} data={block.data as TrophiesData} />;
    case 'blog':
      return <BlogForm {...common} data={block.data as BlogData} />;
    case 'contact':
      return <ContactForm {...common} data={block.data as ContactData} />;
    case 'freeMarkdown':
      return <FreeMarkdownForm {...common} data={block.data as FreeMarkdownData} />;
    default:
      return null;
  }
}
