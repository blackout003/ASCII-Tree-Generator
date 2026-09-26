import { describe, expect, it } from 'vitest';
import { EMPTY_META } from '@/lib/readme/defaults';
import { generateReadme } from '@/lib/readme/generate';
import { createBlock } from '@/lib/readme/state';
import { block, stateWith } from './helpers';

const profile = (blocks: Parameters<typeof stateWith>[0]) => stateWith(blocks, 'profile');

const banner = (over: Record<string, unknown> = {}) => ({
  lines: "Hi, I'm Jane\nFull stack developer",
  font: 'Fira Code',
  size: 24,
  width: 500,
  align: 'center',
  color: '',
  baseUrl: '',
  ...over,
});

const BANNER_URL =
  "https://readme-typing-svg.demolab.com/?font=Fira%20Code&amp;size=24&amp;width=500&amp;height=54&amp;color=0969da&amp;center=true&amp;vCenter=true&amp;lines=Hi%2C+I'm+Jane;Full+stack+developer";

describe('banner block', () => {
  it('renders a centered typing SVG with the accent color', () => {
    expect(generateReadme(profile([block('b', 'banner', banner())]))).toBe(
      `<div align="center">\n\n![Hi, I'm Jane](${BANNER_URL})\n\n</div>\n`
    );
  });

  it('renders a left-aligned banner without the wrapper', () => {
    const output = generateReadme(profile([block('b', 'banner', banner({ align: 'left' }))]));
    expect(output).toBe(`![Hi, I'm Jane](${BANNER_URL.replace('center=true', 'center=false')})\n`);
  });

  it('uses the chosen color and a self-hosted base URL', () => {
    const output = generateReadme(
      profile([block('b', 'banner', banner({ color: 'ff0000', baseUrl: 'https://typing.example.com/' }))])
    );
    expect(output).toContain('(https://typing.example.com/?font=Fira%20Code');
    expect(output).toContain('color=ff0000');
  });

  it('renders nothing for an invalid base URL or without text', () => {
    expect(generateReadme(profile([block('b', 'banner', banner({ baseUrl: 'http://typing.example.com' }))]))).toBe('');
    expect(generateReadme(profile([block('b', 'banner', banner({ lines: ' \n ' }))]))).toBe('');
  });

  it('keeps the URL valid for text with separators and special characters', () => {
    const output = generateReadme(profile([block('b', 'banner', banner({ lines: 'a;b\n50% off + #1' }))]));
    expect(output).toContain('lines=a%2Cb;50%25+off+%2B+%231');
  });

  it('keeps at most five lines of at most 100 characters', () => {
    const many = Array.from({ length: 7 }, (_, i) => `line ${i}`).join('\n');
    const query = /lines=([^)]*)\)/.exec(generateReadme(profile([block('b', 'banner', banner({ lines: many }))])))![1];
    expect(query.split(';')).toHaveLength(5);
    const long = /lines=([^)]*)\)/.exec(generateReadme(profile([block('b', 'banner', banner({ lines: 'a'.repeat(150) }))])))![1];
    expect(long).toBe('a'.repeat(100));
  });

  it('is created from the name and description, in the README language', () => {
    const created = createBlock('banner', { ...EMPTY_META, name: 'Jane', description: 'Dev', language: 'fr' });
    expect((created.data as { lines: string }).lines).toBe("Salut, moi c'est Jane\nDev");
    expect((createBlock('banner', EMPTY_META).data as { lines: string }).lines).toBe('');
  });
});

describe('bio block', () => {
  const data = { heading: "Hi 👋, I'm Jane", intro: 'I build things.', points: '🔭 Working on x\n- not a list' };

  it('renders the heading, the introduction and the points as a list', () => {
    expect(generateReadme(profile([block('b', 'bio', data)]))).toBe(
      "## Hi 👋, I'm Jane\n\nI build things.\n\n- 🔭 Working on x\n- \\- not a list\n"
    );
  });

  it('renders nothing when only the heading is filled', () => {
    expect(generateReadme(profile([block('b', 'bio', { ...data, intro: '', points: '' })]))).toBe('');
  });

  it('is created with a greeting that uses the name, in the README language', () => {
    const heading = (meta: Partial<typeof EMPTY_META>) =>
      (createBlock('bio', { ...EMPTY_META, ...meta }).data as { heading: string }).heading;
    expect(heading({ name: 'Jane' })).toBe("Hi 👋, I'm Jane");
    expect(heading({})).toBe('Hi there 👋');
    expect(heading({ name: 'Jane', language: 'fr' })).toBe("Salut 👋, moi c'est Jane");
  });
});
