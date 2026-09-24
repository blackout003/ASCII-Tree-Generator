'use client';

import React, { useState } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Moon, Sun } from '@/components/icons';
import { README_MARKDOWN_PROPS } from '@/lib/readme/markdown-pipeline';
import { cn } from '@/lib/utils';
// Single highlight.js theme, same as the Markdown editor's preview.
import 'highlight.js/styles/github-dark.css';
import './readme-preview.css';

type PreviewImageProps = React.ComponentPropsWithoutRef<'img'> & { node?: unknown };

/** Shows the alt text when an external image (badge, stats card…) fails to load. */
function PreviewImage({ node, src, alt, ...rest }: PreviewImageProps) {
  void node;
  const [failed, setFailed] = useState(false);
  if (typeof src !== 'string' || failed) {
    return <span className="italic opacity-70">{alt}</span>;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img {...rest} src={src} alt={alt ?? ''} onError={() => setFailed(true)} />;
}

const COMPONENTS: Components = {
  img: (props) => <PreviewImage key={String(props.src)} {...props} />,
};

interface ReadmePreviewProps {
  markdown: string;
}

export function ReadmePreview({ markdown }: ReadmePreviewProps) {
  const t = useTranslations('readmeGenerator');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          {t('preview.title')}
        </CardTitle>
        <div className="flex gap-2" role="group" aria-label={t('preview.title')}>
          <Button size="sm" variant={theme === 'light' ? 'default' : 'outline'} aria-pressed={theme === 'light'} onClick={() => setTheme('light')}>
            <Sun className="w-4 h-4 mr-1" />
            {t('preview.light')}
          </Button>
          <Button size="sm" variant={theme === 'dark' ? 'default' : 'outline'} aria-pressed={theme === 'dark'} onClick={() => setTheme('dark')}>
            <Moon className="w-4 h-4 mr-1" />
            {t('preview.dark')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          data-theme={theme}
          className={cn(
            'readme-preview prose max-w-none min-h-[200px] rounded-md border p-6',
            theme === 'dark' ? 'prose-invert bg-[#0d1117]' : 'bg-white'
          )}
        >
          {markdown ? (
            <ReactMarkdown {...README_MARKDOWN_PROPS} components={COMPONENTS}>
              {markdown}
            </ReactMarkdown>
          ) : (
            <p className="opacity-60">{t('preview.empty')}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
