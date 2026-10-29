import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gallery-border bg-gallery-milk mt-28 py-16 text-gallery-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="md:col-span-2 space-y-4">
            <span className="font-serif text-2xl text-gallery-ink font-medium tracking-tight">
              НАЇВ
            </span>
            <p className="text-sm leading-relaxed max-w-md text-gallery-muted font-sans">
              Камерна галерея та студія оригінальної керамічної пластики.
              Кожен твір виліплено вручну без використання форм та 3D-технологій.
              Єдині екземпляри (1/1) у традиціях українського наївного мистецтва.
            </p>
            <div className="pt-2 text-xs text-gallery-muted">
              Київ • Україна • Воздвиженська
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-museum text-gallery-ink">
              Експозиція
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-gallery-ink transition-colors">
                  {t.nav.works}
                </Link>
              </li>
              <li>
                <Link to="/archive" className="hover:text-gallery-ink transition-colors">
                  {t.nav.archive}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-gallery-ink transition-colors">
                  {t.nav.about}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gallery-ink transition-colors">
                  {t.nav.contact}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Direct contact & Acquisition */}
          <div className="space-y-3">
            <div className="text-xs font-semibold uppercase tracking-museum text-gallery-ink">
              Зв'язок з автором
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://t.me/naive_sculptures"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gallery-ink transition-colors"
                >
                  Telegram: @naive_sculptures
                </a>
              </li>
              <li>
                <a
                  href="mailto:artist@naive-sculptures.art"
                  className="hover:text-gallery-ink transition-colors"
                >
                  artist@naive-sculptures.art
                </a>
              </li>
              <li>
                <span className="text-xs text-gallery-muted block pt-1">
                  Пряма оплата на картку майстра. Доставка Новою Поштою або DHL.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gallery-border/50 flex flex-col sm:flex-row justify-between items-center text-xs text-gallery-muted gap-4">
          <div>
            © {currentYear} Naive Art Sculpture Gallery. Всі права захищено.
          </div>
          <div className="flex items-center space-x-6">
            <span>AWS Free Tier Architecture</span>
            <Link to="/admin" className="hover:text-gallery-ink transition-colors">
              Панель автора
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
