import { useState, useEffect, useRef } from 'react';
import { Sun, Moon, Globe, ChevronDown, Check, Menu, X, MessageSquare, Zap, Shield, BookOpen, Compass } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        // Only close if not clicking the hamburger toggle
      }
    };

    window.addEventListener('kernel_language_changed', handleLangChange);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('kernel_language_changed', handleLangChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
    { label: labels.story, id: 'origin', icon: BookOpen },
    { label: labels.world, id: 'lattice', icon: Compass },
    { label: labels.powers, id: 'abilities', icon: Zap },
    { label: labels.emergency, id: 'root-access', icon: Shield },
    { label: labels.mission, id: 'mission', icon: MessageSquare },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(id);
    }
  };

  return (
    <>
      <nav className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-3.5 sm:px-6 py-2 sm:py-2.5 bg-white/90 dark:bg-black/65 backdrop-blur-xl border border-gray-200/90 dark:border-white/15 rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] w-[95%] sm:w-[92%] max-w-5xl transition-all duration-300">
        
        {/* Brand / Logo */}
        <button 
          onClick={() => handleNavClick('top')}
          className="flex items-center space-x-2 sm:space-x-3 cursor-pointer text-left group shrink-0"
        >
          <div className="relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center">
            <div className="absolute inset-0 rounded-lg bg-emerald-500/25 blur-sm group-hover:blur-md transition-all"></div>
            <img 
              src="/kernel-logo.jpg" 
              alt="Kernel Superhero Sigil" 
              className="w-full h-full object-cover rounded-md border border-emerald-500/60 shadow-[0_0_10px_rgba(16,185,129,0.5)] group-hover:scale-110 group-hover:border-emerald-400 transition-all duration-300"
            />
          </div>
          <div className="flex items-center">
            <span className="font-pixel text-emerald-700 dark:text-emerald-400 tracking-[0.2em] text-[11px] sm:text-xs font-bold flex items-center gap-1 sm:gap-1.5">
              KERNEL
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </span>
          </div>
        </button>

        {/* Center Links (Desktop only) */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="text-xs sm:text-sm font-sans font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors tracking-wide cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Language selector dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setLangDropdownOpen((prev) => !prev)}
              title="Select Language"
              className="flex items-center space-x-1 text-xs font-sans text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-gray-200/90 dark:border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer bg-gray-50/80 dark:bg-white/5"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="font-medium text-[10px] sm:text-[11px] uppercase">{lang}</span>
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
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-700" />
            )}
          </button>

          {/* Desktop Action CTA: Talk to Theo */}
          <button
            onClick={() => handleNavClick('top')}
            className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full border border-emerald-600/80 dark:border-emerald-500/60 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-400 dark:hover:text-black text-emerald-800 dark:text-emerald-300 text-xs font-sans font-medium transition-all duration-200 cursor-pointer shadow-sm shrink-0"
          >
            <span>{labels.contact}</span>
            <span className="text-[10px]">→</span>
          </button>

          {/* Mobile Menu Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 rounded-lg border border-gray-200/90 dark:border-white/10 text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 bg-gray-50/80 dark:bg-white/5 cursor-pointer transition-colors"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Navigation Backdrop & Sheet */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-in fade-in duration-200">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div 
            ref={mobileMenuRef}
            className="absolute top-16 inset-x-3 bg-white/95 dark:bg-[#0b0f16]/95 border border-gray-200 dark:border-white/15 rounded-3xl shadow-2xl p-5 backdrop-blur-2xl animate-in slide-in-from-top-4 duration-250 max-h-[82vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-white/10 mb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-pixel text-[10px] text-emerald-600 dark:text-emerald-400 tracking-widest uppercase">
                  NAVIGATION RELAY
                </span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 mb-4">
              {navItems.map((item) => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-sans font-medium text-gray-800 dark:text-gray-200 hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <ItemIcon className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <span className="text-gray-400 text-xs">→</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-white/10">
              <button
                onClick={() => handleNavClick('top')}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>{labels.contact}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

