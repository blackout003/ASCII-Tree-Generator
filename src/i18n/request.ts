import {getRequestConfig} from 'next-intl/server';
import {locales, defaultLocale, type Locale} from './locales';

export default getRequestConfig(async ({locale}) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    messages: (await import(`./locales/${locale}.json`)).default,
    locale: locale
  };
});
