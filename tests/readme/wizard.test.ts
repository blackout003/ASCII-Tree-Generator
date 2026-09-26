import { describe, expect, it } from 'vitest';
import { EMPTY_META, META_LIMITS } from '@/lib/readme/defaults';
import { getDefaultText } from '@/lib/readme/default-texts';
import { BLOCK_TYPES, getBlockDefinition, getRecommendedTypes } from '@/lib/readme/registry';
import { applyWizard } from '@/lib/readme/state';
import { block, freeMarkdown, header, stateWith } from './helpers';

const usage = (id: string, heading: string) =>
  block(id, 'usage', { heading, description: '', code: '', language: '' });
const license = (id: string, data: Record<string, string> = {}) =>
  block(id, 'license', { heading: 'License', license: '', holder: '', year: '', credits: '', ...data });
const dataOf = (result: ReturnType<typeof applyWizard>, id: string) =>
  result.blocks.find((b) => b.id === id)!.data as Record<string, unknown>;

describe('applyWizard on an existing README', () => {
  it('leaves the blocks untouched when the chosen mode is the current one', () => {
    // Clicking "Profile" then "Project" inside the wizard changes nothing until the end.
    const base = stateWith([header('h', { title: 'Mine' }), usage('u', 'Usage'), license('l'), freeMarkdown('f', 'keep')]);
    const result = applyWizard(base, {
      mode: 'project',
      selected: ['header', 'usage', 'license', 'freeMarkdown'],
      isNew: false,
    });
    expect(result.blocks).toEqual(base.blocks);
  });

  it('drops the blocks the chosen mode does not offer, once, at the end', () => {
    const base = stateWith([header('h', { title: 'Mine' }), freeMarkdown('f', 'keep')]);
    const result = applyWizard(base, { mode: 'profile', selected: ['freeMarkdown'], isNew: false });
    expect(result.mode).toBe('profile');
    expect(result.blocks.map((b) => b.id)).toEqual(['f']);
  });

  it('fills the empty fields of kept blocks from the meta and never overwrites a typed value', () => {
    const base = {
      ...stateWith([header('h', { title: '', tagline: 'typed' })]),
      meta: { ...EMPTY_META, name: 'Renamed', description: 'Desc' },
    };
    const result = applyWizard(base, { mode: 'project', selected: ['header'], isNew: false });
    expect(dataOf(result, 'h')).toMatchObject({ title: 'Renamed', tagline: 'typed' });
  });

  it('re-seeds headings that are still a default text when the README language changes', () => {
    const base = {
      ...stateWith([usage('u1', 'Usage'), usage('u2', 'Getting started'), license('l')]),
      meta: { ...EMPTY_META, language: 'fr' as const },
    };
    const result = applyWizard(base, { mode: 'project', selected: ['usage', 'license'], isNew: false });
    expect(dataOf(result, 'u1').heading).toBe('Utilisation');
    expect(dataOf(result, 'u2').heading).toBe('Getting started');
    expect(dataOf(result, 'l').heading).toBe('Licence');
  });

  it('seeds an empty badges block from the meta license but keeps existing badges', () => {
    const empty = block('b1', 'badges', { items: [] });
    const filled = block('b2', 'badges', { items: [{ label: 'build', message: 'ok', color: '', link: '' }] });
    const base = { ...stateWith([empty, filled]), meta: { ...EMPTY_META, license: 'MIT' } };
    const result = applyWizard(base, { mode: 'project', selected: ['badges'], isNew: false });
    expect(dataOf(result, 'b1').items).toEqual([{ label: 'license', message: 'MIT', color: '', link: '' }]);
    expect(dataOf(result, 'b2').items).toEqual([{ label: 'build', message: 'ok', color: '', link: '' }]);
  });

  it('adds the newly ticked sections and removes the unticked ones', () => {
    const base = stateWith([header('h', { title: 'Mine' }), usage('u', 'Usage')]);
    const result = applyWizard(base, { mode: 'project', selected: ['header', 'license'], isNew: false });
    expect(result.blocks.map((b) => b.type)).toEqual(['header', 'license']);
    expect(result.blocks[0].id).toBe('h');
  });

  it('never produces a block that fails its own schema, even from the longest meta', () => {
    const longest = {
      name: 'x'.repeat(META_LIMITS.name),
      description: 'x'.repeat(META_LIMITS.description),
      author: 'x'.repeat(META_LIMITS.author),
      license: 'x'.repeat(META_LIMITS.license),
      repoUrl: 'x'.repeat(META_LIMITS.repoUrl),
      installCommand: 'x'.repeat(META_LIMITS.installCommand),
      username: 'x'.repeat(META_LIMITS.username),
      language: 'ja' as const,
    };
    const base = {
      ...stateWith([
        header('h', { title: '', tagline: '' }),
        block('b', 'badges', { items: [] }),
        usage('u', 'Usage'),
        license('l'),
        block('i', 'installation', { heading: 'Installation', prerequisites: '', manager: 'none', packageName: '', commands: '' }),
      ]),
      meta: longest,
    };
    const result = applyWizard(base, {
      mode: 'project',
      selected: ['header', 'badges', 'usage', 'license', 'installation'],
      isNew: false,
    });
    for (const b of result.blocks) {
      expect(getBlockDefinition(b.type).parseData(b.data).success, b.type).toBe(true);
    }
  });
});

describe('applyWizard on a new README', () => {
  it('creates the selected blocks of the chosen mode, seeded from the collected info', () => {
    const fresh = { ...stateWith([]), meta: { ...EMPTY_META, name: 'Demo', description: 'Desc' } };
    const result = applyWizard(fresh, { mode: 'project', selected: ['usage', 'header'], isNew: true });
    expect(result.blocks.map((b) => b.type)).toEqual(['header', 'usage']);
    expect(result.blocks[0].data).toMatchObject({ title: 'Demo', tagline: 'Desc' });
  });

  it('applies a mode chosen in the wizard', () => {
    const result = applyWizard(stateWith([]), { mode: 'profile', selected: ['freeMarkdown', 'header'], isNew: true });
    expect(result.mode).toBe('profile');
    expect(result.blocks.map((b) => b.type)).toEqual(['freeMarkdown']);
  });
});

describe('applyWizard for a profile', () => {
  const stats = (id: string, username: string) =>
    block(id, 'stats', {
      heading: 'GitHub stats',
      username,
      baseUrl: '',
      showStats: true,
      showLanguages: true,
      layout: 'compact',
      hideBorder: true,
    });

  it('creates the recommended profile blocks, seeded from the collected info and language', () => {
    const fresh = {
      ...stateWith([], 'profile'),
      meta: { ...EMPTY_META, name: 'Jane', username: 'jane', description: 'Dev', language: 'fr' as const },
    };
    const result = applyWizard(fresh, { mode: 'profile', selected: getRecommendedTypes('profile'), isNew: true });
    expect(result.blocks.map((b) => b.type)).toEqual(['banner', 'bio', 'skills', 'stats', 'contact']);
    const [banner, bio, , statsBlock] = result.blocks.map((b) => b.data as Record<string, string>);
    expect(banner.lines).toBe("Salut, moi c'est Jane\nDev");
    expect(bio.heading).toBe(getDefaultText('fr', 'bio').replace('{name}', 'Jane'));
    expect(statsBlock.username).toBe('jane');
  });

  it('fills an empty username from the meta and never overwrites a typed one', () => {
    const base = { ...stateWith([stats('a', ''), stats('b', 'typed')], 'profile'), meta: { ...EMPTY_META, username: 'octocat' } };
    const result = applyWizard(base, { mode: 'profile', selected: ['stats'], isNew: false });
    expect(dataOf(result, 'a').username).toBe('octocat');
    expect(dataOf(result, 'b').username).toBe('typed');
  });

  it('re-seeds a greeting heading that is still the default text when the language changes', () => {
    const anonymous = block('bio', 'bio', { heading: getDefaultText('en', 'bioAnonymous'), intro: '', points: '' });
    const custom = block('own', 'bio', { heading: 'My own title', intro: '', points: '' });
    const base = { ...stateWith([anonymous, custom], 'profile'), meta: { ...EMPTY_META, language: 'fr' as const } };
    const result = applyWizard(base, { mode: 'profile', selected: ['bio'], isNew: false });
    expect(dataOf(result, 'bio').heading).toBe(getDefaultText('fr', 'bioAnonymous'));
    expect(dataOf(result, 'own').heading).toBe('My own title');
  });

  it('never produces a profile block that fails its own schema, even from the longest meta', () => {
    const longest = {
      name: 'x'.repeat(META_LIMITS.name),
      description: 'x'.repeat(META_LIMITS.description),
      author: 'x'.repeat(META_LIMITS.author),
      license: 'x'.repeat(META_LIMITS.license),
      repoUrl: 'x'.repeat(META_LIMITS.repoUrl),
      installCommand: 'x'.repeat(META_LIMITS.installCommand),
      username: 'x'.repeat(META_LIMITS.username),
      language: 'ja' as const,
    };
    const profileTypes = BLOCK_TYPES.filter((type) => getBlockDefinition(type).modes.includes('profile'));
    const result = applyWizard({ ...stateWith([], 'profile'), meta: longest }, { mode: 'profile', selected: profileTypes, isNew: true });
    expect(result.blocks.map((b) => b.type)).toEqual(profileTypes);
    for (const b of result.blocks) {
      expect(getBlockDefinition(b.type).parseData(b.data).success, b.type).toBe(true);
    }
  });
});
