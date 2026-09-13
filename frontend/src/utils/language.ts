export type Language = 
  | 'en' 
  | 'es' 
  | 'fr' 
  | 'de' 
  | 'ja' 
  | 'hi' 
  | 'ml' 
  | 'ar' 
  | 'pt' 
  | 'ru';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം', flag: '🇮🇳' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語', flag: '🇯🇵' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية', flag: '🇸🇦' },
  { code: 'pt', label: 'Portuguese', nativeLabel: 'Português', flag: '🇧🇷' },
  { code: 'ru', label: 'Russian', nativeLabel: 'Русский', flag: '🇷🇺' },
];

const LANG_KEY = 'kernel_language';

export const getStoredLanguage = (): Language => {
  try {
    const saved = localStorage.getItem(LANG_KEY) as Language;
    if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) return saved;
  } catch {
    // fallback if localStorage restricted
  }
  return 'en';
};

export const setStoredLanguage = (lang: Language) => {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // fallback
  }
  window.dispatchEvent(new CustomEvent('kernel_language_changed', { detail: lang }));
};
