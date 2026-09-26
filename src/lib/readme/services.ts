import { safeUrl } from './markdown-utils';

// Third-party image services are reached through URLs built from user input. Every
// value is validated here, or encoded, before it can end up in one.

const GITHUB_USERNAME = /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/;

/** A valid GitHub username (without a leading `@`), or '' when the value is not one. */
export function cleanUsername(value: string): string {
  const name = value.trim().replace(/^@/, '');
  return GITHUB_USERNAME.test(name) ? name : '';
}

export type BaseUrl = { status: 'empty' } | { status: 'invalid' } | { status: 'ok'; url: string };

const MAX_BASE_URL_LENGTH = 300;
const BASE_URL = /^https:\/\/[A-Za-z0-9](?:[A-Za-z0-9.-]{0,251}[A-Za-z0-9])?(?::\d{1,5})?(?:\/[A-Za-z0-9._~-]+)*\/?$/;

/**
 * The base address of a self-hosted service: https only, no query string, no
 * fragment, no space. The returned URL has no trailing slash.
 */
export function parseBaseUrl(value: string): BaseUrl {
  const trimmed = value.trim();
  if (trimmed === '') return { status: 'empty' };
  if (trimmed.length > MAX_BASE_URL_LENGTH || !BASE_URL.test(trimmed)) return { status: 'invalid' };
  return { status: 'ok', url: trimmed.replace(/\/+$/, '') };
}

/** `key=value` with the value percent-encoded. */
export function param(key: string, value: string | number | boolean): string {
  return `${key}=${encodeURIComponent(String(value))}`;
}

/**
 * Two images of the same card, one per GitHub theme. GitHub shows the one that
 * matches the viewer's theme and hides the other (the preview does the same).
 */
export function themedPair(alt: string, lightUrl: string, darkUrl: string): string {
  return `![${alt}](${lightUrl}#gh-light-mode-only) ![${alt}](${darkUrl}#gh-dark-mode-only)`;
}

const MAX_FEED_URL_LENGTH = 500;

/**
 * A feed address safe to put in a YAML double-quoted string and in a
 * comma-separated list: http(s), and none of `,` `"` `'` `\` `<` `>` `` ` ``, whitespace or
 * control characters. `$`, `{` and `}` are refused too: GitHub evaluates `${{ … }}` inside
 * the workflow's `with:` values, so an address carrying `${{ secrets.X }}` would send a
 * secret of the repository to the feed host.
 */
export function safeFeedUrl(value: string): string {
  const url = value.trim();
  return url.length <= MAX_FEED_URL_LENGTH && /^https?:\/\/[^\s,"'\\<>`${}\u0000-\u001f\u007f-\u009f]+$/.test(url)
    ? url
    : '';
}

/** An email address made only of characters that need no escaping in a `mailto:` link. */
export function safeEmail(value: string): string {
  const email = value.trim();
  return /^[A-Za-z0-9._%+-]{1,64}@(?:[A-Za-z0-9-]{1,63}\.){1,8}[A-Za-z]{2,24}$/.test(email) ? email : '';
}

/** A link destination that is an absolute http(s) URL, or ''. */
export function safeWebUrl(value: string): string {
  const url = safeUrl(value);
  return /^https?:\/\//i.test(url) ? url : '';
}
