import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Placeholder dictionaries
const resources = {
  en: {
    translation: {
      "welcome": "Welcome to KERNEL",
      "loading": "SYSTEM BOOT..."
    }
  },
  ml: { translation: {} },
  hi: { translation: {} },
  ta: { translation: {} },
  te: { translation: {} },
  kn: { translation: {} },
  bn: { translation: {} },
  mr: { translation: {} },
  es: { translation: {} },
  fr: { translation: {} },
  de: { translation: {} },
  ar: { translation: {} },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;

