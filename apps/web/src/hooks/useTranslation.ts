"use client";

import { useTranslation as useI18nTranslation } from 'react-i18next';

export function useTranslation() {
  const { t, i18n } = useI18nTranslation();

  const changeLanguage = (locale: string) => {
    i18n.changeLanguage(locale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', locale);
    }
  };

  const getCurrentLanguage = () => {
    return i18n.language;
  };

  const isSpanish = () => {
    return i18n.language === 'es';
  };

  const isEnglish = () => {
    return i18n.language === 'en';
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    isSpanish,
    isEnglish,
    currentLanguage: i18n.language,
  };
}
