"use client";

import { useEffect } from 'react';
import i18n from '@/lib/i18n'; // Importar la configuración de i18n

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Cargar el idioma guardado en localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage === 'es' || savedLanguage === 'en') {
      void i18n.changeLanguage(savedLanguage);
    }
  }, []);

  return <>{children}</>;
}
