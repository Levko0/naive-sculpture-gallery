import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Sparkles, Archive, User, Mail } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    {
      to: '/',
      label: t.nav.works,
      icon: Sparkles,
      isActive: location.pathname === '/' || location.pathname.startsWith('/sculpture/'),
    },
    {
      to: '/archive',
      label: t.nav.archive,
      icon: Archive,
      isActive: location.pathname === '/archive',
    },
    {
      to: '/about',
      label: t.nav.about,
      icon: User,
      isActive: location.pathname === '/about',
    },
    {
      to: '/contact',
      label: t.nav.contact,
      icon: Mail,
      isActive: location.pathname === '/contact',
    },
  ];

  return (
    <nav
      aria-label="Мобільна навігація"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-gallery-milk/95 backdrop-blur-md border-t border-gallery-border shadow-elevation pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-1.5 transition-colors"
    >
      <div className="grid grid-cols-4 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-lg transition-colors ${
                item.isActive
                  ? 'text-gallery-ink font-medium'
                  : 'text-gallery-muted hover:text-gallery-ink'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${item.isActive ? 'scale-110 stroke-[2.2]' : 'stroke-[1.6]'}`} />
                {item.isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gallery-ink rounded-full" />
                )}
              </div>
              <span className={`text-[11px] tracking-tight mt-1 truncate max-w-[70px] ${item.isActive ? 'font-semibold text-gallery-ink' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
