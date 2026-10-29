import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Menu, X, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-gallery-milk/90 backdrop-blur-md border-b border-gallery-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo / Gallery Title */}
          <Link
            to="/"
            className="flex flex-col group transition-transform active:scale-[0.99]"
          >
            <span className="font-serif text-2xl sm:text-3xl tracking-tight text-gallery-ink font-medium">
              НАЇВ
            </span>
            <span className="text-[10px] tracking-museum uppercase text-gallery-muted font-sans -mt-1 group-hover:text-gallery-ink transition-colors">
              Скульптурна Майстерня
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link
              to="/"
              className={`text-sm tracking-wide transition-colors ${
                isActive('/')
                  ? 'text-gallery-ink font-semibold border-b border-gallery-ink pb-0.5'
                  : 'text-gallery-muted hover:text-gallery-ink'
              }`}
            >
              {t.nav.works}
            </Link>
            <Link
              to="/archive"
              className={`text-sm tracking-wide transition-colors ${
                isActive('/archive')
                  ? 'text-gallery-ink font-semibold border-b border-gallery-ink pb-0.5'
                  : 'text-gallery-muted hover:text-gallery-ink'
              }`}
            >
              {t.nav.archive}
            </Link>
            <Link
              to="/about"
              className={`text-sm tracking-wide transition-colors ${
                isActive('/about')
                  ? 'text-gallery-ink font-semibold border-b border-gallery-ink pb-0.5'
                  : 'text-gallery-muted hover:text-gallery-ink'
              }`}
            >
              {t.nav.about}
            </Link>
            <Link
              to="/contact"
              className={`text-sm tracking-wide transition-colors ${
                isActive('/contact')
                  ? 'text-gallery-ink font-semibold border-b border-gallery-ink pb-0.5'
                  : 'text-gallery-muted hover:text-gallery-ink'
              }`}
            >
              {t.nav.contact}
            </Link>
          </nav>

          {/* Right utility: Language toggle & Admin */}
          <div className="hidden md:flex items-center space-x-5">
            {/* Language Switcher */}
            <div className="inline-flex rounded-full border border-gallery-border p-0.5 bg-gallery-stone/50 text-xs">
              <button
                type="button"
                onClick={() => setLanguage('UA')}
                className={`px-2.5 py-1 rounded-full font-medium transition-all ${
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
                className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                  language === 'EN'
                    ? 'bg-gallery-ink text-gallery-milk shadow-sm'
                    : 'text-gallery-muted hover:text-gallery-ink'
                }`}
              >
                EN
              </button>
            </div>

            {/* Admin entry link */}
            <Link
              to="/admin"
              title={t.nav.admin}
              className="text-gallery-muted hover:text-gallery-ink transition-colors p-1.5 rounded hover:bg-gallery-stone"
            >
              <Shield className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center space-x-3">
            {/* Mobile Lang button */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'UA' ? 'EN' : 'UA')}
              className="text-xs font-semibold px-2 py-1 rounded border border-gallery-border text-gallery-ink"
            >
              {language}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gallery-ink hover:text-neutral-600 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gallery-border bg-gallery-milk px-4 pt-2 pb-6 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base py-2 text-gallery-ink border-b border-gallery-border/40"
          >
            {t.nav.works}
          </Link>
          <Link
            to="/archive"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base py-2 text-gallery-ink border-b border-gallery-border/40"
          >
            {t.nav.archive}
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base py-2 text-gallery-ink border-b border-gallery-border/40"
          >
            {t.nav.about}
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-base py-2 text-gallery-ink border-b border-gallery-border/40"
          >
            {t.nav.contact}
          </Link>
          <div className="pt-2 flex justify-between items-center">
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center text-xs text-gallery-muted hover:text-gallery-ink space-x-1"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{t.nav.admin}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
