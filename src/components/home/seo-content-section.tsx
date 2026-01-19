'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';

export function SeoContentSection() {
  const t = useTranslations('seoContent');

  return (
    <section className="container mx-auto p-6 max-w-7xl mt-12 space-y-8">
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 border-0">
        <CardContent className="p-8 space-y-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('intro')}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('whyUse.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('whyUse.para1')}
            </p>
            <ul className="space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{t('whyUse.benefit1')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{t('whyUse.benefit2')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{t('whyUse.benefit3')}</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-blue-500 font-bold">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{t('whyUse.benefit4')}</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {t('howToUse.title')}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('howToUse.para1')}
            </p>
            <ol className="space-y-3 mt-4 list-decimal list-inside">
              <li className="text-gray-700 dark:text-gray-300">{t('howToUse.step1')}</li>
              <li className="text-gray-700 dark:text-gray-300">{t('howToUse.step2')}</li>
              <li className="text-gray-700 dark:text-gray-300">{t('howToUse.step3')}</li>
              <li className="text-gray-700 dark:text-gray-300">{t('howToUse.step4')}</li>
            </ol>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              {t('howToUse.para2')}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('useCases.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('useCases.para1')}
          </p>
          <ul className="space-y-3 mt-4">
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">•</span>
              <span className="text-gray-700 dark:text-gray-300">{t('useCases.useCase1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">•</span>
              <span className="text-gray-700 dark:text-gray-300">{t('useCases.useCase2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">•</span>
              <span className="text-gray-700 dark:text-gray-300">{t('useCases.useCase3')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-500 font-bold">•</span>
              <span className="text-gray-700 dark:text-gray-300">{t('useCases.useCase4')}</span>
            </li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            {t('useCases.para2')}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('features.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {t('features.para1')}
          </p>
          <ul className="space-y-3 mt-4">
            <li className="flex items-start gap-3">
              <span className="text-purple-500 font-bold">★</span>
              <span className="text-gray-700 dark:text-gray-300">{t('features.feature1')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-500 font-bold">★</span>
              <span className="text-gray-700 dark:text-gray-300">{t('features.feature2')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-500 font-bold">★</span>
              <span className="text-gray-700 dark:text-gray-300">{t('features.feature3')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-500 font-bold">★</span>
              <span className="text-gray-700 dark:text-gray-300">{t('features.feature4')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-500 font-bold">★</span>
              <span className="text-gray-700 dark:text-gray-300">{t('features.feature5')}</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-500 font-bold">★</span>
              <span className="text-gray-700 dark:text-gray-300">{t('features.feature6')}</span>
            </li>
          </ul>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            {t('features.para2')}
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
