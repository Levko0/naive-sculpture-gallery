import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ImageWithFallback } from '../components/common/ImageWithFallback';

export const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Editorial Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
        <div className="text-xs font-semibold uppercase tracking-museum text-gallery-muted">
          Маніфест
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-gallery-ink font-medium leading-tight">
          {t.about.title}
        </h1>
        <p className="text-base sm:text-lg text-gallery-muted font-light leading-relaxed">
          {t.about.heroSubtitle}
        </p>
      </div>

      {/* Grid: Image & Story */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center mb-20">
        <div className="lg:col-span-6 aspect-[4/5] bg-gallery-stone gallery-card-border overflow-hidden">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85"
            alt="Ceramic sculpture in master studio"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="lg:col-span-6 space-y-6 text-sm sm:text-base text-gallery-muted leading-relaxed font-light">
          <p>{t.about.storyP1}</p>
          <p>{t.about.storyP2}</p>
          <p>{t.about.storyP3}</p>

          <div className="pt-6 border-t border-gallery-border grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="font-serif text-3xl sm:text-4xl text-gallery-ink font-medium">
                {t.about.stat1Val}
              </div>
              <div className="text-xs text-gallery-muted mt-1 uppercase tracking-wide">
                {t.about.stat1Label}
              </div>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl text-gallery-ink font-medium">
                {t.about.stat2Val}
              </div>
              <div className="text-xs text-gallery-muted mt-1 uppercase tracking-wide">
                {t.about.stat2Label}
              </div>
            </div>
            <div>
              <div className="font-serif text-3xl sm:text-4xl text-gallery-ink font-medium">
                {t.about.stat3Val}
              </div>
              <div className="text-xs text-gallery-muted mt-1 uppercase tracking-wide">
                {t.about.stat3Label}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
