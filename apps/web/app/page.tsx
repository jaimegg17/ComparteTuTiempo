"use client";

import { useTranslation } from '@/hooks/useTranslation';

export default function HomePage() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t('pages.home.title')}
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          {t('pages.home.subtitle')}
        </p>
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <p className="text-gray-700 whitespace-pre-line">
            {t('pages.home.description')}
          </p>
        </div>
      </div>
    </div>
  );
}
