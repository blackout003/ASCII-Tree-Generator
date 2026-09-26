'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from '@/components/icons';

interface WorkflowPanelProps {
  /** The YAML file, or null while the feed address is missing or invalid. */
  workflow: string | null;
  onDownload: () => void;
}

/** Explains the three things the user must do on GitHub for the blog area to fill itself. */
export function WorkflowPanel({ workflow, onDownload }: WorkflowPanelProps) {
  const t = useTranslations('readmeGenerator');

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('workflow.title')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <p>{t('workflow.intro')}</p>
        <ol className="list-decimal space-y-1 pl-5">
          <li>{t('workflow.step1')}</li>
          <li>{t('workflow.step2')}</li>
          <li>{t('workflow.step3')}</li>
        </ol>
        <p className="text-muted-foreground">{t('workflow.note')}</p>
        {workflow ? (
          <Button type="button" size="sm" onClick={onDownload}>
            <Download className="w-4 h-4 mr-1" />
            {t('workflow.download')}
          </Button>
        ) : (
          <p role="status" className="text-muted-foreground">
            {t('workflow.noFeed')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
