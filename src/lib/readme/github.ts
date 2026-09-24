import { z } from 'zod';
import { clean, compact, normalizeRepoUrl, type ExtractResult, type GithubRef } from './extract';

export const GITHUB_API = 'https://api.github.com';

const repoSchema = z.object({
  name: z.string(),
  description: z.string().nullish(),
  html_url: z.string().nullish(),
  license: z.object({ spdx_id: z.string().nullish() }).nullish(),
  owner: z.object({ login: z.string() }).nullish(),
});

/** SPDX ids GitHub returns when it could not identify a license. */
const NOT_A_LICENSE = new Set(['NOASSERTION', 'OTHER']);

/**
 * Public repository metadata: a single unauthenticated request, so it uses at
 * most one of the 60 requests per hour GitHub allows per address. `fetchFn` is
 * injectable for tests. Never throws: every failure becomes an error code.
 */
export async function fetchGithubMeta(
  ref: GithubRef,
  fetchFn: typeof fetch = fetch,
  timeoutMs = 8000
): Promise<ExtractResult> {
  let response: Response;
  try {
    response = await fetchFn(`${GITHUB_API}/repos/${encodeURIComponent(ref.owner)}/${encodeURIComponent(ref.repo)}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch {
    return { ok: false, error: 'network' };
  }

  if (response.status === 404) return { ok: false, error: 'notFound' };
  if (response.status === 429 || (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0')) {
    return { ok: false, error: 'rateLimit' };
  }
  if (!response.ok) return { ok: false, error: 'invalidResponse' };

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return { ok: false, error: 'invalidResponse' };
  }
  const parsed = repoSchema.safeParse(body);
  if (!parsed.success) return { ok: false, error: 'invalidResponse' };

  const repo = parsed.data;
  const spdx = clean(repo.license?.spdx_id);
  return {
    ok: true,
    meta: compact({
      name: clean(repo.name),
      description: clean(repo.description),
      license: NOT_A_LICENSE.has(spdx) ? '' : spdx,
      repoUrl: normalizeRepoUrl(clean(repo.html_url)),
      author: clean(repo.owner?.login),
    }),
  };
}
