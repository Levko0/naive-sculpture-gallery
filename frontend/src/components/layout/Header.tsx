import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-gallery-milk border-b border-gallery-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo / Gallery Title */}
          <Link
            to="/"
            className="flex flex-col group transition-transform active:scale-[0.99] py-2"
          >
            <span className="font-serif text-2xl sm:text-3xl tracking-tight text-gallery-ink font-medium">
              {language === 'UA' ? 'НАЇВ' : 'NAIV'}
            </span>
            <span className="text-[10px] tracking-museum uppercase text-gallery-muted font-sans -mt-1 group-hover:text-gallery-ink transition-colors">
              {language === 'UA' ? 'Скульптурна Майстерня' : 'Sculpture Studio'}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              to="/"
              className={`text-sm tracking-wide transition-colors min-h-[44px] flex items-center ${
                isActive('/')
                  ? 'text-gallery-ink font-semibold border-b border-gallery-ink pb-0.5'
                  : 'text-gallery-muted hover:text-gallery-ink'
              }`}
            >
              {t.nav.works}
            </Link>
            <Link
              to="/archive"
              className={`text-sm tracking-wide transition-colors min-h-[44px] flex items-center ${
                isActive('/archive')
                  ? 'text-gallery-ink font-semibold border-b border-gallery-ink pb-0.5'
                  : 'text-gallery-muted hover:text-gallery-ink'
              }`}
            >
              {t.nav.archive}
            </Link>
            <Link
              to="/about"
              className={`text-sm tracking-wide transition-colors min-h-[44px] flex items-center ${
                isActive('/about')
                  ? 'text-gallery-ink font-semibold border-b border-gallery-ink pb-0.5'
                  : 'text-gallery-muted hover:text-gallery-ink'
              }`}
            >
              {t.nav.about}
            </Link>
            <Link
              to="/contact"
              className={`text-sm tracking-wide transition-colors min-h-[44px] flex items-center ${
                isActive('/contact')
                  ? 'text-gallery-ink font-semibold border-b border-gallery-ink pb-0.5'
                  : 'text-gallery-muted hover:text-gallery-ink'
              }`}
            >
              {t.nav.contact}
            </Link>
          </nav>

          {/* Language Switcher (Desktop & Mobile) */}
          <div className="flex items-center space-x-3">
            <div className="inline-flex rounded-full border border-gallery-border p-1 bg-gallery-stone/50 text-xs">
              <button
                type="button"
                onClick={() => setLanguage('UA')}
                aria-label="Українська мова"
                className={`px-3 py-1.5 min-h-[36px] min-w-[36px] rounded-full font-medium transition-all ${
                  language === 'UA'
                    ? 'bg-gallery-ink text-gallery-milk shadow-sm'
                    : 'text-gallery-muted hover:text-gallery-ink'
                }`}
              >
                UA
              </button>
              <button
                type="button"
                onClick={() => setLanguage('EN')}
                aria-label="English language"
                className={`px-3 py-1.5 min-h-[36px] min-w-[36px] rounded-full font-medium transition-all ${
                  language === 'EN'
                    ? 'bg-gallery-ink text-gallery-milk shadow-sm'
                    : 'text-gallery-muted hover:text-gallery-ink'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
