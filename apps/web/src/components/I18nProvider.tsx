"use client";

import { useEffect } from 'react';
import '@/lib/i18n'; // Importar la configuración de i18n

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Cargar el idioma guardado en localStorage
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'es' || savedLanguage === 'en')) {
      // El idioma se cargará automáticamente cuando se importe i18n
    }
  }, []);

  return <>{children}</>;
}
