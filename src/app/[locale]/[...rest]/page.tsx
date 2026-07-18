import { notFound } from 'next/navigation';

/**
 * Catch-all for unmatched paths under a locale (e.g. `/fr/does-not-exist`).
 * Triggering `notFound()` here renders the localized `[locale]/not-found.tsx`
 * (with sidebar, theme and the correct locale) instead of bubbling up to the
 * bare root 404.
 */
export default function CatchAll() {
  notFound();
}
