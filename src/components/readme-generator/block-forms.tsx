'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FREE_MARKDOWN_MAX_LENGTH, type FreeMarkdownData } from '@/lib/readme/blocks/free-markdown';
import { HEADER_LIMITS, type HeaderData } from '@/lib/readme/blocks/header';
import type { Block } from '@/lib/readme/types';

interface FormProps<T> {
  idPrefix: string;
  data: T;
  onChange: (data: T) => void;
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function HeaderForm({ idPrefix, data, onChange }: FormProps<HeaderData>) {
  const t = useTranslations('readmeGenerator');
  const set = (patch: Partial<HeaderData>) => onChange({ ...data, ...patch });

  return (
    <div className="space-y-3">
      <Field id={`${idPrefix}-title`} label={t('fields.title')}>
        <Input
          id={`${idPrefix}-title`}
          value={data.title}
          maxLength={HEADER_LIMITS.title}
          placeholder={t('placeholders.title')}
          onChange={(e) => set({ title: e.target.value })}
        />
      </Field>
      <Field id={`${idPrefix}-tagline`} label={t('fields.tagline')}>
        <Input
          id={`${idPrefix}-tagline`}
          value={data.tagline}
          maxLength={HEADER_LIMITS.tagline}
          placeholder={t('placeholders.tagline')}
          onChange={(e) => set({ tagline: e.target.value })}
        />
      </Field>
      <Field id={`${idPrefix}-logoUrl`} label={t('fields.logoUrl')}>
        <Input
          id={`${idPrefix}-logoUrl`}
          value={data.logoUrl}
          maxLength={HEADER_LIMITS.logoUrl}
          placeholder={t('placeholders.logoUrl')}
          onChange={(e) => set({ logoUrl: e.target.value })}
        />
      </Field>
      <Field id={`${idPrefix}-logoAlt`} label={t('fields.logoAlt')}>
        <Input
          id={`${idPrefix}-logoAlt`}
          value={data.logoAlt}
          maxLength={HEADER_LIMITS.logoAlt}
          placeholder={t('placeholders.logoAlt')}
          onChange={(e) => set({ logoAlt: e.target.value })}
        />
      </Field>
    </div>
  );
}

function FreeMarkdownForm({ idPrefix, data, onChange }: FormProps<FreeMarkdownData>) {
  const t = useTranslations('readmeGenerator');

  return (
    <Field id={`${idPrefix}-content`} label={t('fields.content')}>
      <Textarea
        id={`${idPrefix}-content`}
        className="min-h-[220px] font-mono text-sm"
        value={data.content}
        maxLength={FREE_MARKDOWN_MAX_LENGTH}
        placeholder={t('placeholders.content')}
        onChange={(e) => onChange({ content: e.target.value })}
      />
    </Field>
  );
}

interface BlockFormProps {
  block: Block;
  onChange: (data: unknown) => void;
}

/** Picks the form for a block type. Add one case per new block type. */
export function BlockForm({ block, onChange }: BlockFormProps) {
  switch (block.type) {
    case 'header':
      return <HeaderForm idPrefix={block.id} data={block.data as HeaderData} onChange={onChange} />;
    case 'freeMarkdown':
      return <FreeMarkdownForm idPrefix={block.id} data={block.data as FreeMarkdownData} onChange={onChange} />;
    default:
      return null;
  }
}
