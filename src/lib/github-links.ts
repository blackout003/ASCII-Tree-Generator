export const GITHUB_REPO_URL = 'https://github.com/blackout003/ASCII-Tree-Generator';

/** Issue forms live in .github/ISSUE_TEMPLATE (bug_report.md, feature_request.md). */
export const GITHUB_ISSUE_URLS = {
  bug: `${GITHUB_REPO_URL}/issues/new?template=bug_report.md`,
  feature: `${GITHUB_REPO_URL}/issues/new?template=feature_request.md`,
} as const;
