import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Dynamic import of all language files
const importLocales = import.meta.glob('./locales/*.json', { eager: true });

// Build resources object dynamically
const resources = Object.keys(importLocales).reduce((acc, path) => {
  const langCode = path.match(/\.\/locales\/(\w+)\.json$/)?.[1];
  if (langCode) {
    acc[langCode] = {
      translation: (importLocales[path] as { default: any }).default
    };
  }
  return acc;
}, {} as { [key: string]: { translation: any } });

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false
    }
  });

// Utility function to change language
export const changeLanguage = (lng: string) => {
  return i18n.changeLanguage(lng);
};

export default i18n;