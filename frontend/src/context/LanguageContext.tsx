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
    const saved = localStorage.getItem('nsg_lang');
    return (saved === 'EN' || saved === 'UA') ? saved : 'UA'; // Ukrainian is default
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nsg_lang', lang);
    document.documentElement.lang = lang.toLowerCase();
  };

  useEffect(() => {
    document.documentElement.lang = language.toLowerCase();
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
