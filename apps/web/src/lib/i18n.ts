import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import esTranslations from '../../public/locales/es/common.json';
import enTranslations from '../../public/locales/en/common.json';

const resources = {
  es: {
    common: esTranslations,
  },
  en: {
    common: enTranslations,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es',
    fallbackLng: 'es',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false,
    },
    
    defaultNS: 'common',
    ns: ['common'],
  });

export default i18n;
