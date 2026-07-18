'use client';

import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Bold, Italic, Heading1, List, Link2, Code2, Quote } from '@/components/icons';
import { useTranslations } from 'next-intl';

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  onChange: (value: string) => void;
}

/** Wrap the current selection with `before`/`after` markers (e.g. **bold**). */
function wrapSelection(
  el: HTMLTextAreaElement,
  value: string,
  before: string,
  after: string,
  placeholder: string
): { next: string; selStart: number; selEnd: number } {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  return {
    next,
    selStart: start + before.length,
    selEnd: start + before.length + selected.length,
  };
}

/** Prefix every line touched by the selection (e.g. "## ", "- ", "> "). */
function prefixLines(
  el: HTMLTextAreaElement,
  value: string,
  prefix: string
): { next: string; selStart: number; selEnd: number } {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const block = value.slice(lineStart, end);
  const prefixed = block
    .split('\n')
    .map((line) => prefix + line)
    .join('\n');
  const next = value.slice(0, lineStart) + prefixed + value.slice(end);
  return {
    next,
    selStart: start + prefix.length,
    selEnd: end + (prefixed.length - block.length),
  };
}

export function MarkdownToolbar({ textareaRef, value, onChange }: MarkdownToolbarProps) {
  const t = useTranslations('markdownEditor');

  const apply = useCallback(
    (fn: (el: HTMLTextAreaElement) => { next: string; selStart: number; selEnd: number }) => {
      const el = textareaRef.current;
      if (!el) return;
      const { next, selStart, selEnd } = fn(el);
      onChange(next);
      // Restore focus/selection after React re-renders the controlled textarea.
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(selStart, selEnd);
      });
    },
    [onChange, textareaRef]
  );

  const actions = [
    { key: 'bold', icon: Bold, run: (el: HTMLTextAreaElement) => wrapSelection(el, value, '**', '**', t('placeholders.bold')) },
    { key: 'italic', icon: Italic, run: (el: HTMLTextAreaElement) => wrapSelection(el, value, '*', '*', t('placeholders.italic')) },
    { key: 'heading', icon: Heading1, run: (el: HTMLTextAreaElement) => prefixLines(el, value, '## ') },
    { key: 'quote', icon: Quote, run: (el: HTMLTextAreaElement) => prefixLines(el, value, '> ') },
    { key: 'list', icon: List, run: (el: HTMLTextAreaElement) => prefixLines(el, value, '- ') },
    { key: 'code', icon: Code2, run: (el: HTMLTextAreaElement) => wrapSelection(el, value, '`', '`', t('placeholders.code')) },
    { key: 'link', icon: Link2, run: (el: HTMLTextAreaElement) => wrapSelection(el, value, '[', '](url)', t('placeholders.link')) },
  ] as const;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-wrap items-center gap-1">
        {actions.map(({ key, icon: Icon, run }) => (
          <Tooltip key={key}>
            <TooltipTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => apply(run)}
                aria-label={t(`toolbar.${key}`)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t(`toolbar.${key}`)}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}
