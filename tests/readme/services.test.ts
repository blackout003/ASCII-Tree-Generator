import { describe, expect, it } from 'vitest';
import {
  cleanUsername,
  param,
  parseBaseUrl,
  safeEmail,
  safeFeedUrl,
  safeWebUrl,
  themedPair,
} from '@/lib/readme/services';

describe('cleanUsername', () => {
  it.each([
    ['octocat', 'octocat'],
    ['@octocat', 'octocat'],
    ['  a-b  ', 'a-b'],
    ['a'.repeat(39), 'a'.repeat(39)],
    ['a'.repeat(40), ''],
    ['-a', ''],
    ['a-', ''],
    ['a b', ''],
    ['a&b=c', ''],
    ['a/b', ''],
    ['', ''],
  ])('cleans %j to %j', (input, expected) => {
    expect(cleanUsername(input)).toBe(expected);
  });
});

describe('parseBaseUrl', () => {
  it.each(['', '   '])('treats %j as empty', (input) => {
    expect(parseBaseUrl(input)).toEqual({ status: 'empty' });
  });

  it.each([
    ['https://stats.example.com', 'https://stats.example.com'],
    ['  https://stats.example.com/  ', 'https://stats.example.com'],
    ['https://stats.example.com/api/v1/', 'https://stats.example.com/api/v1'],
    ['https://x.example.com:8080', 'https://x.example.com:8080'],
    ['https://my-app.vercel.app', 'https://my-app.vercel.app'],
  ])('accepts %j', (input, url) => {
    expect(parseBaseUrl(input)).toEqual({ status: 'ok', url });
  });

  it.each([
    'http://x.example.com',
    'https://',
    'https://x.example.com?a=1',
    'https://x.example.com#top',
    'https://x .example.com',
    'https://x.example.com/a b',
    'javascript:alert(1)',
    '//x.example.com',
    `https://${'a'.repeat(400)}.com`,
  ])('rejects %j', (input) => {
    expect(parseBaseUrl(input)).toEqual({ status: 'invalid' });
  });

  it('runs in linear time on hostile input', () => {
    const start = performance.now();
    parseBaseUrl('https://' + 'a.'.repeat(150) + '/' + 'a/'.repeat(150) + '?');
    parseBaseUrl('https://a' + '-'.repeat(299));
    expect(performance.now() - start).toBeLessThan(100);
  });
});

describe('param / themedPair', () => {
  it('encodes the value', () => {
    expect(param('font', 'Fira Code')).toBe('font=Fira%20Code');
    expect(param('lines', "a&b=c#d'e")).toBe("lines=a%26b%3Dc%23d'e");
    expect(param('size', 24)).toBe('size=24');
    expect(param('center', true)).toBe('center=true');
  });

  it('builds the light and dark variant GitHub picks between', () => {
    expect(themedPair('Alt', 'https://x/l', 'https://x/d')).toBe(
      '![Alt](https://x/l#gh-light-mode-only) ![Alt](https://x/d#gh-dark-mode-only)'
    );
  });
});

describe('safeFeedUrl', () => {
  it.each(['https://blog.example.com/feed.xml', 'http://blog.example.com/rss?x=1'])('keeps %j', (url) => {
    expect(safeFeedUrl(` ${url} `)).toBe(url);
  });

  it.each([
    '',
    'ftp://x.example.com/feed',
    'https://x.example.com/a,b',
    'https://x.example.com/"y',
    "https://x.example.com/'y",
    'https://x.example.com/a b',
    'https://x.example.com/a\\b',
    'https://x.example.com/<y>',
    'https://x.example.com/`y`',
    'javascript:alert(1)',
    // GitHub evaluates ${{ … }} inside a workflow's `with:` values: it would leak a secret to the feed host.
    'https://x.example.com/f?t=${{github.token}}',
    'https://x.example.com/f?t=${{ secrets.X }}',
    'https://x.example.com/$HOME',
    'https://x.example.com/{a}',
    'https://x.example.com/a\u0001b',
    'https://x.example.com/a\u0085b',
    'https://x.example.com/a\u007fb',
    `https://x.example.com/${'a'.repeat(500)}`,
  ])('rejects %j', (url) => {
    expect(safeFeedUrl(url)).toBe('');
  });
});

describe('safeEmail', () => {
  it.each(['jane@example.com', 'a.b+c@sub.example.co', ' jane@example.com '])('keeps %j', (value) => {
    expect(safeEmail(value)).toBe(value.trim());
  });

  it.each(['', 'jane@', '@x.io', 'a b@x.io', 'a@x', 'a@x..io', 'a@x.io\nb@y.io', '<a@x.io>', 'a@x.io?subject=hi'])(
    'rejects %j',
    (value) => {
      expect(safeEmail(value)).toBe('');
    }
  );
});

describe('safeWebUrl', () => {
  it('keeps http(s) URLs and drops everything else, including relative ones', () => {
    expect(safeWebUrl('https://x.io/a')).toBe('https://x.io/a');
    expect(safeWebUrl('javascript:alert(1)')).toBe('');
    expect(safeWebUrl('mailto:a@x.io')).toBe('');
    expect(safeWebUrl('./relative')).toBe('');
    expect(safeWebUrl('')).toBe('');
  });
});
