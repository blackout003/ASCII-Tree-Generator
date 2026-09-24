import { describe, expect, it } from 'vitest';
import { EMPTY_META, META_LIMITS } from '@/lib/readme/defaults';
import {
  MAX_MANIFEST_BYTES,
  mergeMeta,
  parseCargoToml,
  parseGithubUrl,
  parseManifestFile,
  parsePackageJson,
  parsePyproject,
} from '@/lib/readme/extract';

const toml = (...lines: string[]) => lines.join('\n');

describe('parsePackageJson', () => {
  it('reads the fields and builds an install command', () => {
    const text = JSON.stringify({
      name: '@scope/demo',
      description: 'A demo',
      license: 'MIT',
      repository: { type: 'git', url: 'git+https://github.com/o/r.git' },
      author: 'Jane Doe <jane@x.io> (https://x.io)',
    });
    expect(parsePackageJson(text)).toEqual({
      ok: true,
      meta: {
        name: '@scope/demo',
        description: 'A demo',
        license: 'MIT',
        repoUrl: 'https://github.com/o/r',
        author: 'Jane Doe',
        installCommand: 'npm install @scope/demo',
      },
    });
  });

  it('accepts shorthand repositories, author objects and license objects', () => {
    const result = parsePackageJson(
      JSON.stringify({ name: 'a', repository: 'github:o/r', author: { name: 'Jane' }, license: { type: 'ISC' } })
    );
    expect(result).toEqual({
      ok: true,
      meta: { name: 'a', repoUrl: 'https://github.com/o/r', author: 'Jane', license: 'ISC', installCommand: 'npm install a' },
    });
    expect(parsePackageJson(JSON.stringify({ repository: 'o/r' }))).toEqual({
      ok: true,
      meta: { repoUrl: 'https://github.com/o/r' },
    });
  });

  it('ignores values of the wrong type and non-web repository addresses', () => {
    const text = JSON.stringify({
      name: 42,
      description: ['x'],
      license: { type: 'ISC' },
      repository: 'javascript:alert(1)',
      author: { name: 5 },
    });
    expect(parsePackageJson(text)).toEqual({ ok: true, meta: { license: 'ISC' } });
  });

  it('flattens line breaks and does not build a command from an unsafe name', () => {
    const result = parsePackageJson(JSON.stringify({ name: 'a b; rm -rf', description: 'x\ny' }));
    expect(result).toEqual({ ok: true, meta: { name: 'a b; rm -rf', description: 'x y' } });
  });

  it.each(['not json', 'null', '[]', '42', '"text"', ''])('rejects %j as an invalid file', (text) => {
    expect(parsePackageJson(text)).toEqual({ ok: false, error: 'invalidFile' });
  });
});

describe('parseCargoToml', () => {
  it('reads the [package] section, ignoring comments and other sections', () => {
    const text = toml(
      '[package]',
      'name = "demo"   # a comment',
      'version = "0.1.0"',
      'description = "A demo # not a comment"',
      'license = "MIT OR Apache-2.0"',
      'repository = "https://github.com/o/r"',
      'authors = ["Jane Doe <jane@x.io>", "Bob"]',
      '',
      '[dependencies]',
      'serde = "1"'
    );
    expect(parseCargoToml(text)).toEqual({
      ok: true,
      meta: {
        name: 'demo',
        description: 'A demo # not a comment',
        license: 'MIT OR Apache-2.0',
        repoUrl: 'https://github.com/o/r',
        author: 'Jane Doe',
        installCommand: 'cargo add demo',
      },
    });
  });

  it('unescapes quotes, skips multi-line strings and array-of-tables entries', () => {
    const text = toml(
      '[package]',
      'name = "demo"',
      'description = "say \\"hi\\""',
      '[[bin]]',
      'name = "not-the-package"',
      '[other]',
      'license = "GPL"'
    );
    expect(parseCargoToml(text)).toEqual({
      ok: true,
      meta: { name: 'demo', description: 'say "hi"', installCommand: 'cargo add demo' },
    });
    const multiline = toml('[package]', 'name = "demo"', 'description = """', 'long', '"""');
    expect(parseCargoToml(multiline)).toEqual({ ok: true, meta: { name: 'demo', installCommand: 'cargo add demo' } });
  });

  it('rejects a file without a [package] section', () => {
    expect(parseCargoToml('[workspace]\nmembers = []')).toEqual({ ok: false, error: 'invalidFile' });
    expect(parseCargoToml('')).toEqual({ ok: false, error: 'invalidFile' });
  });
});

describe('parsePyproject', () => {
  it('reads a PEP 621 [project] table', () => {
    const text = toml(
      '[project]',
      'name = "demo-pkg"',
      'description = "A demo"',
      'license = { text = "MIT" }',
      'authors = [{ name = "Jane Doe", email = "jane@x.io" }]',
      '',
      '[project.urls]',
      'Homepage = "https://demo.example"',
      'Repository = "https://github.com/o/r"'
    );
    expect(parsePyproject(text)).toEqual({
      ok: true,
      meta: {
        name: 'demo-pkg',
        description: 'A demo',
        license: 'MIT',
        repoUrl: 'https://github.com/o/r',
        author: 'Jane Doe',
        installCommand: 'pip install demo-pkg',
      },
    });
  });

  it('reads a Poetry [tool.poetry] table', () => {
    const text = toml(
      '[tool.poetry]',
      'name = "poet"',
      'description = "P"',
      'license = "Apache-2.0"',
      'authors = ["Jane <j@x.io>"]',
      'repository = "https://github.com/o/p"'
    );
    expect(parsePyproject(text)).toEqual({
      ok: true,
      meta: {
        name: 'poet',
        description: 'P',
        license: 'Apache-2.0',
        repoUrl: 'https://github.com/o/p',
        author: 'Jane',
        installCommand: 'pip install poet',
      },
    });
  });

  it('rejects a file with neither table', () => {
    expect(parsePyproject('[build-system]\nrequires = []')).toEqual({ ok: false, error: 'invalidFile' });
  });
});

describe('parseManifestFile', () => {
  it('picks the parser from the file name, ignoring the folder and the case', () => {
    expect(parseManifestFile('package.json', '{"name":"a"}').ok).toBe(true);
    expect(parseManifestFile('my/dir/Cargo.TOML', '[package]\nname = "a"').ok).toBe(true);
    expect(parseManifestFile('C:\\x\\pyproject.toml', '[project]\nname = "a"').ok).toBe(true);
  });

  it('rejects other files and oversized ones', () => {
    expect(parseManifestFile('README.md', '# x')).toEqual({ ok: false, error: 'unsupportedFile' });
    expect(parseManifestFile('package.json', ' '.repeat(MAX_MANIFEST_BYTES + 1))).toEqual({
      ok: false,
      error: 'invalidFile',
    });
  });

  it('handles very large hostile values quickly', () => {
    const huge = 900_000;
    const cases: [string, string][] = [
      ['package.json', JSON.stringify({ name: 'a', author: '<'.repeat(huge), description: ' '.repeat(huge) })],
      ['Cargo.toml', toml('[package]', `name = "${'a'.repeat(huge)}"`, `description = ${' '.repeat(50_000)}x`)],
      ['pyproject.toml', toml('[project]', `authors = [${'{ name = "x" ,'.repeat(50_000)}]`, `name = "ok"`)],
    ];
    for (const [file, text] of cases) {
      const start = performance.now();
      parseManifestFile(file, text);
      expect(performance.now() - start, file).toBeLessThan(500);
    }
  });
});

describe('parseGithubUrl', () => {
  it.each([
    ['https://github.com/o/r', { owner: 'o', repo: 'r' }],
    ['github.com/o/r.git', { owner: 'o', repo: 'r' }],
    ['http://www.github.com/o/r/', { owner: 'o', repo: 'r' }],
    ['  https://github.com/my.org/my.repo  ', { owner: 'my.org', repo: 'my.repo' }],
  ])('accepts %j', (input, expected) => {
    expect(parseGithubUrl(input)).toEqual(expected);
  });

  it.each([
    '',
    'https://github.com/o',
    'https://evil.example/github.com/o/r',
    'https://github.com/../r',
    'https://github.com/o/..',
    'https://github.com/o/r/tree/main',
    'https://github.com/o/r?x=1',
    'ftp://github.com/o/r',
    'javascript:alert(1)',
    `https://github.com/${'a'.repeat(101)}/r`,
  ])('rejects %j', (input) => {
    expect(parseGithubUrl(input)).toBeNull();
  });
});

describe('mergeMeta', () => {
  it('fills only the empty fields and reports them in order', () => {
    const current = { ...EMPTY_META, name: 'Typed', description: '   ' };
    const { meta, filled } = mergeMeta(current, { name: 'Other', description: 'From file', license: 'MIT' });
    expect(meta).toEqual({ ...current, description: 'From file', license: 'MIT' });
    expect(filled).toEqual(['description', 'license']);
  });

  it('flattens line breaks and skips empty values', () => {
    const { meta, filled } = mergeMeta(EMPTY_META, { name: 'a\nb', author: '  ', repoUrl: '' });
    expect(meta.name).toBe('a b');
    expect(filled).toEqual(['name']);
  });

  it('truncates every value to its META_LIMITS so blocks seeded from it stay valid', () => {
    const long = 'x'.repeat(5000);
    const { meta } = mergeMeta(EMPTY_META, {
      name: long, description: long, license: long, repoUrl: long, author: long, installCommand: long,
    });
    expect(meta.name).toHaveLength(META_LIMITS.name);
    expect(meta.description).toHaveLength(META_LIMITS.description);
    expect(meta.license).toHaveLength(META_LIMITS.license);
    expect(meta.repoUrl).toHaveLength(META_LIMITS.repoUrl);
    expect(meta.author).toHaveLength(META_LIMITS.author);
    expect(meta.installCommand).toHaveLength(META_LIMITS.installCommand);
  });

  it('never touches the README language', () => {
    expect(mergeMeta({ ...EMPTY_META, language: 'fr' }, { name: 'a' }).meta.language).toBe('fr');
  });
});
