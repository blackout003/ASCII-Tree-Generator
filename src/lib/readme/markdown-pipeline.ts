import type { Options as ReactMarkdownOptions } from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema, type Options as SanitizeSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { remarkAlert } from 'remark-github-blockquote-alert';

const attributes = defaultSchema.attributes ?? {};

/**
 * GitHub's default sanitization rules, extended with what README files rely on:
 * `<picture>`/`<source>` for light/dark images, and the markup produced by the
 * alert plugin (`div.markdown-alert-*`, `p.markdown-alert-title`, a small inline
 * `<svg>` icon). Only the exact class names and attributes used are allowed.
 */
export const README_SANITIZE_SCHEMA: SanitizeSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), 'picture', 'source', 'svg', 'path'],
  attributes: {
    ...attributes,
    div: [...(attributes.div ?? []), 'align', ['className', /^markdown-alert(-[a-z]+)?$/]],
    p: [...(attributes.p ?? []), 'align', ['className', 'markdown-alert-title']],
    img: [...(attributes.img ?? []), 'width', 'height', 'align'],
    source: ['media', 'srcSet', 'type'],
    svg: ['viewBox', 'width', 'height', 'ariaHidden', ['className', 'octicon']],
    path: ['d'],
  },
};

/**
 * Props spread on `<ReactMarkdown>`. Order matters: raw HTML is parsed first,
 * then sanitized, then code blocks are highlighted (highlight classes are added
 * after sanitizing, so they survive).
 */
export const README_MARKDOWN_PROPS: Pick<
  ReactMarkdownOptions,
  'remarkPlugins' | 'remarkRehypeOptions' | 'rehypePlugins'
> = {
  remarkPlugins: [remarkGfm, remarkAlert],
  remarkRehypeOptions: { allowDangerousHtml: true },
  rehypePlugins: [rehypeRaw, [rehypeSanitize, README_SANITIZE_SCHEMA], rehypeHighlight],
};
