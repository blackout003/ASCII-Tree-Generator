'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';
// Single highlight.js theme; its dark code background reads well in both app themes.
import 'highlight.js/styles/github-dark.css';

interface MarkdownPreviewProps {
  /** The Markdown source to render. */
  source: string;
  /** Ref on the rendered container, used to read innerHTML for "copy HTML". */
  contentRef?: React.Ref<HTMLDivElement>;
  className?: string;
}

export function MarkdownPreview({ source, contentRef, className }: MarkdownPreviewProps) {
  return (
    <div
      ref={contentRef}
      className={cn('prose dark:prose-invert max-w-none', className)}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
