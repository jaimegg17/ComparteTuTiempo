"use client";

import { useEffect } from 'react';
import i18n from '@/lib/i18n';

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Load the language stored in localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'es' || savedLanguage === 'en') {
      void i18n.changeLanguage(savedLanguage);
    }
  }, []);

  return <>{children}</>;
}
