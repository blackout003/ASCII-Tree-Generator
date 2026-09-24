import { describe, expect, it } from 'vitest';
import { fetchGithubMeta, GITHUB_API } from '@/lib/readme/github';

type Handler = (url: string, init?: RequestInit) => Response | Promise<Response>;

function fakeFetch(handler: Handler): typeof fetch {
  return (async (input: RequestInfo | URL, init?: RequestInit) => handler(String(input), init)) as typeof fetch;
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const ref = { owner: 'octo', repo: 'hello.world' };

describe('fetchGithubMeta', () => {
  it('makes one request to the repository endpoint and maps the fields', async () => {
    const calls: { url: string; accept: string | null }[] = [];
    const result = await fetchGithubMeta(
      ref,
      fakeFetch((url, init) => {
        calls.push({ url, accept: new Headers(init?.headers).get('accept') });
        return json({
          name: 'hello.world',
          description: 'Desc',
          html_url: 'https://github.com/octo/hello.world',
          license: { spdx_id: 'MIT' },
          owner: { login: 'octo' },
        });
      })
    );
    expect(calls).toEqual([{ url: `${GITHUB_API}/repos/octo/hello.world`, accept: 'application/vnd.github+json' }]);
    expect(result).toEqual({
      ok: true,
      meta: {
        name: 'hello.world',
        description: 'Desc',
        license: 'MIT',
        repoUrl: 'https://github.com/octo/hello.world',
        author: 'octo',
      },
    });
  });

  it('copes with null fields and a license GitHub could not identify', async () => {
    const result = await fetchGithubMeta(
      ref,
      fakeFetch(() => json({ name: 'x', description: null, license: { spdx_id: 'NOASSERTION' }, owner: { login: 'o' } }))
    );
    expect(result).toEqual({ ok: true, meta: { name: 'x', author: 'o' } });
    const noLicense = await fetchGithubMeta(ref, fakeFetch(() => json({ name: 'x', license: null })));
    expect(noLicense).toEqual({ ok: true, meta: { name: 'x' } });
  });

  it('encodes the owner and repository in the URL', async () => {
    let requested = '';
    await fetchGithubMeta(
      { owner: 'a b', repo: 'c/d' },
      fakeFetch((url) => {
        requested = url;
        return json({ name: 'x' });
      })
    );
    expect(requested).toBe(`${GITHUB_API}/repos/a%20b/c%2Fd`);
  });

  it.each([
    ['a missing repository', () => new Response('{}', { status: 404 }), 'notFound'],
    ['HTTP 429', () => new Response('', { status: 429 }), 'rateLimit'],
    [
      'HTTP 403 with no request left',
      () => new Response('{}', { status: 403, headers: { 'x-ratelimit-remaining': '0' } }),
      'rateLimit',
    ],
    // The spec maps every 403 to the rate-limit message: GitHub's secondary limits send no header.
    ['HTTP 403 without a rate-limit header', () => new Response('{}', { status: 403 }), 'rateLimit'],
    ['a server error', () => new Response('oops', { status: 500 }), 'invalidResponse'],
    ['a body that is not JSON', () => new Response('<html>', { status: 200 }), 'invalidResponse'],
    ['a body without a name', () => json({ description: 'x' }), 'invalidResponse'],
    ['a body that is not an object', () => json([1, 2]), 'invalidResponse'],
  ])('reports %s', async (_label, respond, error) => {
    expect(await fetchGithubMeta(ref, fakeFetch(respond))).toEqual({ ok: false, error });
  });

  it('reports a network failure without throwing', async () => {
    const failing = fakeFetch(() => {
      throw new TypeError('Failed to fetch');
    });
    expect(await fetchGithubMeta(ref, failing)).toEqual({ ok: false, error: 'network' });
  });

  it('cuts oversized values', async () => {
    const result = await fetchGithubMeta(ref, fakeFetch(() => json({ name: 'x', description: 'y'.repeat(100_000) })));
    expect(result.ok && result.meta.description?.length).toBe(2000);
  });
});
