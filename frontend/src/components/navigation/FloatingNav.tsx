import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Globe, ChevronDown, Check } from 'lucide-react';
import { getStoredLanguage, setStoredLanguage, SUPPORTED_LANGUAGES, type Language } from '../../utils/language';

interface FloatingNavProps {
  onNavigate?: (sectionId: string) => void;
}

const NAV_LABELS: Record<Language, {
  story: string;
  world: string;
  powers: string;
  emergency: string;
  mission: string;
  contact: string;
}> = {
  en: {
    story: 'Story',
    world: 'The World',
    powers: 'Powers',
    emergency: 'Emergency',
    mission: 'Mission',
    contact: 'Talk to Theo',
  },
  es: {
    story: 'Historia',
    world: 'El Mundo',
    powers: 'Poderes',
    emergency: 'Emergencia',
    mission: 'Misión',
    contact: 'Hablar con Theo',
  },
  fr: {
    story: 'Histoire',
    world: 'Le Monde',
    powers: 'Pouvoirs',
    emergency: 'Urgence',
    mission: 'Mission',
    contact: 'Parler à Theo',
  },
  de: {
    story: 'Geschichte',
    world: 'Die Welt',
    powers: 'Kräfte',
    emergency: 'Notfall',
    mission: 'Mission',
    contact: 'Mit Theo sprechen',
  },
  ja: {
    story: 'ストーリー',
    world: '世界観',
    powers: '能力',
    emergency: '緊急アクセス',
    mission: '使命',
    contact: 'Theoと話す',
  },
  hi: {
    story: 'कहानी',
    world: 'दुनिया',
    powers: 'शक्तियां',
    emergency: 'आपातकालीन',
    mission: 'मिशन',
    contact: 'थियो से बात करें',
  },
  ml: {
    story: 'കഥ',
    world: 'ലോകം',
    powers: 'ശക്തികൾ',
    emergency: 'അടിയന്തരാവസ്ഥ',
    mission: 'ദൗത്യം',
    contact: 'തിയോയോട് സംസാരിക്കുക',
  },
  ar: {
    story: 'القصة',
    world: 'العالم',
    powers: 'القدرات',
    emergency: 'طوارئ',
    mission: 'المهمة',
    contact: 'تحدث مع ثيو',
  },
  pt: {
    story: 'História',
    world: 'O Mundo',
    powers: 'Poderes',
    emergency: 'Emergência',
    mission: 'Missão',
    contact: 'Falar com Theo',
  },
  ru: {
    story: 'История',
    world: 'Мир',
    powers: 'Способности',
    emergency: 'Чрезвычайный доступ',
    mission: 'Миссия',
    contact: 'Связаться с Тео',
  },
};

export default function FloatingNav({ onNavigate }: FloatingNavProps) {
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState<Language>(getStoredLanguage());
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Default to dark mode
    const savedTheme = localStorage.getItem('kernel_theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<Language>;
      if (customEvent.detail) {
        setLang(customEvent.detail);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };

    window.addEventListener('kernel_language_changed', handleLangChange);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('kernel_language_changed', handleLangChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('kernel_theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('kernel_theme', 'dark');
      setIsDark(true);
    }
  };

  const handleSelectLanguage = (newLang: Language) => {
    setLang(newLang);
    setStoredLanguage(newLang);
    setLangDropdownOpen(false);
  };

  const labels = NAV_LABELS[lang] || NAV_LABELS.en;

  const navItems = [
    { label: labels.story, id: 'origin' },
    { label: labels.world, id: 'lattice' },
    { label: labels.powers, id: 'abilities' },
    { label: labels.emergency, id: 'root-access' },
    { label: labels.mission, id: 'mission' },
  ];

  return (
    <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-5 sm:px-7 py-2.5 bg-white/85 dark:bg-black/55 backdrop-blur-xl border border-gray-200/90 dark:border-white/15 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] w-[94%] max-w-5xl transition-all duration-300">
      
      {/* Brand / Logo */}
      <button 
        onClick={() => onNavigate && onNavigate('top')}
        className="flex items-center space-x-3 cursor-pointer text-left group"
      >
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-lg bg-emerald-500/25 blur-sm group-hover:blur-md transition-all"></div>
          <img 
            src="/kernel-logo.jpg" 
            alt="Kernel Superhero Sigil" 
            className="w-full h-full object-cover rounded-md border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:scale-110 group-hover:border-emerald-400 group-hover:shadow-[0_0_15px_rgba(52,211,153,0.8)] transition-all duration-300"
          />
        </div>
        <div className="flex items-center">
          <span className="font-pixel text-emerald-700 dark:text-emerald-400 tracking-[0.2em] text-xs font-bold flex items-center gap-1.5">
            KERNEL
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </span>
        </div>
      </button>

      {/* Center Links with clean intuitive human-friendly wording */}
      <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate && onNavigate(item.id)}
            className="text-xs sm:text-sm font-sans font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors tracking-wide cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right Controls: Theme, Language Dropdown, CTA */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Language selector dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLangDropdownOpen((prev) => !prev)}
            title="Select Language"
            className="flex items-center space-x-1.5 text-xs font-sans text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-2.5 py-1.5 rounded-lg border border-gray-200/90 dark:border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer bg-gray-50/80 dark:bg-white/5"
          >
            <Globe className="w-3.5 h-3.5" />
            <span className="font-medium text-[11px] uppercase">{lang}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${langDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating Language Dropdown Menu */}
          {langDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 max-h-72 overflow-y-auto rounded-2xl bg-white/95 dark:bg-[#0c1017]/95 border border-gray-200 dark:border-white/15 shadow-2xl backdrop-blur-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="sticky top-0 bg-white/95 dark:bg-[#0c1017]/95 px-3 py-1.5 text-[9px] font-mono tracking-widest uppercase text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-white/5 mb-1 backdrop-blur-md">
                Select Language
              </div>
              {SUPPORTED_LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  onClick={() => handleSelectLanguage(item.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans transition-all cursor-pointer ${
                    lang === item.code
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <span className="text-sm">{item.flag}</span>
                    <span>{item.nativeLabel}</span>
                  </span>
                  {lang === item.code && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme toggle (Light / Dark Mode) */}
        <button
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-1.5 sm:p-2 rounded-full border border-gray-200/90 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/50 bg-gray-50/80 dark:bg-white/5 transition-all cursor-pointer"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-emerald-700" />
          )}
        </button>

        {/* Action CTA: Talk to Theo */}
        <button
          onClick={() => onNavigate && onNavigate('top')}
          className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-emerald-600/80 dark:border-emerald-500/60 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-400 dark:hover:text-black text-emerald-800 dark:text-emerald-300 text-xs font-sans font-medium transition-all duration-200 cursor-pointer shadow-sm"
        >
          <span>{labels.contact}</span>
          <span className="text-[10px]">→</span>
        </button>
      </div>
    </nav>
  );
}
