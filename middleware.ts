import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/i18n/locales';

export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,
  
  // Used when no locale matches
  defaultLocale: defaultLocale,
  
  // Always show the locale in the URL
  localePrefix: 'always'
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|en|it|es|de|pt|ru|ja)/:path*']
};
