import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import rw from './locales/rw.json';

export const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'rw', label: 'Kinyarwanda', short: 'RW' },
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, rw: { translation: rw } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'rw'],
    nonExplicitSupportedLngs: true,
    interpolation: { escapeValue: false }, // React already escapes output
    detection: {
      // English is the default; only an explicit choice (stored in localStorage) switches language
      order: ['localStorage'],
      lookupLocalStorage: 'jc_lang',
      caches: ['localStorage'],
    },
    returnNull: false,
  });

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});
document.documentElement.lang = i18n.language || 'en';

export default i18n;
