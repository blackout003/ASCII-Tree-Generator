'use client';

import React, { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Upload } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  MAX_MANIFEST_BYTES,
  parseGithubUrl,
  parseManifestFile,
  type ExtractedKey,
  type ExtractedMeta,
  type ExtractResult,
} from '@/lib/readme/extract';
import { fetchGithubMeta } from '@/lib/readme/github';

type Status = { kind: 'idle' } | { kind: 'loading' } | { kind: 'done'; failed: boolean; message: string };

interface ExtractionPanelProps {
  /** Merges the extracted values into the README and returns the fields it filled. */
  onExtracted: (extracted: ExtractedMeta) => ExtractedKey[];
}

export function ExtractionPanel({ onExtracted }: ExtractionPanelProps) {
  const t = useTranslations('readmeGenerator');
  const fileInput = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const finish = (result: ExtractResult) => {
    if (!result.ok) {
      setStatus({ kind: 'done', failed: true, message: t(`extraction.${result.error}`) });
      return;
    }
    const filled = onExtracted(result.meta);
    const message =
      filled.length > 0
        ? t('extraction.success', { fields: filled.map((key) => t(`meta.${key}`)).join(', ') })
        : t('extraction.nothing');
    setStatus({ kind: 'done', failed: false, message });
  };

  const handleFile = async (file: File) => {
    if (file.size > MAX_MANIFEST_BYTES) {
      finish({ ok: false, error: 'invalidFile' });
      return;
    }
    try {
      finish(parseManifestFile(file.name, await file.text()));
    } catch {
      finish({ ok: false, error: 'invalidFile' });
    }
  };

  const handleFetch = async () => {
    const ref = parseGithubUrl(url);
    if (!ref) {
      finish({ ok: false, error: 'invalidUrl' });
      return;
    }
    setStatus({ kind: 'loading' });
    finish(await fetchGithubMeta(ref));
  };

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="space-y-2">
        <Label>{t('extraction.file')}</Label>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" size="sm" variant="outline" onClick={() => fileInput.current?.click()}>
            <Upload className="w-4 h-4 mr-1" />
            {t('extraction.choose')}
          </Button>
          <span className="text-xs text-muted-foreground">{t('extraction.privacy')}</span>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept=".json,.toml,application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="extraction-url">{t('extraction.url')}</Label>
        <div className="flex gap-2">
          <Input
            id="extraction-url"
            value={url}
            maxLength={300}
            placeholder={t('placeholders.repoUrl')}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleFetch();
            }}
          />
          <Button type="button" size="sm" disabled={url.trim() === '' || status.kind === 'loading'} onClick={() => void handleFetch()}>
            {t('extraction.fetch')}
          </Button>
        </div>
      </div>
      <p
        role="status"
        aria-live="polite"
        className={status.kind === 'done' && status.failed ? 'text-sm text-destructive' : 'text-sm text-muted-foreground'}
      >
        {status.kind === 'done' ? status.message : ''}
      </p>
    </div>
  );
}
