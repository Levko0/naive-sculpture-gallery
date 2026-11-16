import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { dictionaries } from '../i18n/dictionaries';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof dictionaries.UA;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('nsg_lang');
      return (saved === 'EN' || saved === 'UA') ? saved : 'UA'; // Ukrainian is default
    }
    return 'UA';
  });

  const getHtmlLangCode = (lang: Language) => (lang === 'UA' ? 'uk' : 'en');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.setItem('nsg_lang', lang);
      document.documentElement.lang = getHtmlLangCode(lang);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = getHtmlLangCode(language);
    }
  }, [language]);

  const t = dictionaries[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
