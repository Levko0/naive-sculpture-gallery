import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SEO } from '../components/common/SEO';
import { ArrowLeft, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { language } = useLanguage();

  return (
    <div className="max-w-3xl mx-auto px-4 py-28 sm:py-36 text-center space-y-6">
      <SEO
        title={language === 'UA' ? 'Сторінку не знайдено (404) | Рустам Жураєв' : 'Page Not Found (404) | Rustam Zhuraiev'}
        description={language === 'UA' ? 'Сторінку не знайдено в онлайн-галереї Рустама Жураєва.' : 'Page not found in Rustam Zhuraiev naive sculpture gallery.'}
        noindex={true}
      />
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gallery-stone border border-gallery-border text-gallery-ink mb-2">
        <Compass className="w-8 h-8 stroke-[1.5]" />
      </div>

      <div className="text-xs font-semibold uppercase tracking-museum text-gallery-muted">
        404
      </div>

      <h1 className="font-serif text-3xl sm:text-5xl text-gallery-ink font-medium">
        {language === 'UA' ? 'Сторінку не знайдено' : 'Page Not Found'}
      </h1>

      <p className="text-sm sm:text-base text-gallery-muted max-w-md mx-auto leading-relaxed font-light">
        {language === 'UA'
          ? 'Можливо, скульптуру було переміщено до приватної колекції, адресу змінено або посилання застаріло.'
          : 'Perhaps the artwork has been moved to a private collection or the requested URL has changed.'}
      </p>

      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center min-h-[44px] px-6 py-3 rounded-full bg-gallery-ink text-gallery-milk hover:bg-neutral-800 transition-colors text-xs font-medium uppercase tracking-museum space-x-2 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'UA' ? 'Повернутися до галереї' : 'Back to Gallery'}</span>
        </Link>
      </div>
    </div>
  );
};
