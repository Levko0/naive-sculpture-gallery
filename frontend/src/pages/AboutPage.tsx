import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ArrowRight, Landmark, Heart, MapPin, Quote } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Editorial Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4 mb-16 sm:mb-20">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gallery-stone/60 text-xs font-semibold uppercase tracking-museum text-gallery-muted border border-gallery-border/40">
          <MapPin className="w-3.5 h-3.5 text-gallery-muted" />
          {t.about.badge}
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-gallery-ink font-medium leading-tight">
          {t.about.title}
        </h1>
        <p className="text-base sm:text-xl text-gallery-muted font-light leading-relaxed max-w-2xl mx-auto">
          {t.about.heroSubtitle}
        </p>
      </div>

      {/* Main Grid: Portrait & Core Story */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20 sm:mb-24">
        {/* Author Image Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-[3/4] bg-gallery-stone gallery-card-border overflow-hidden shadow-subtle">
            <ImageWithFallback
              src="/author/rustam-zhuraiev.webp"
              fallbackSrc="/sculptures/anhelyk.webp"
              alt={language === 'UA' ? 'Рустам Жураєв — скульптор' : 'Rustam Zhuraiev — sculptor'}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-xs text-center text-gallery-muted font-sans tracking-wide">
            {language === 'UA'
              ? 'Рустам Жураєв у творчому процесі'
              : 'Rustam Zhuraiev in creative dialogue with stone'}
          </p>

          {/* Key Metrics / Highlights */}
          <div className="pt-6 border-t border-gallery-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-gallery-stone/30 rounded">
              <div className="font-serif text-2xl sm:text-3xl text-gallery-ink font-medium">
                {t.about.stat1Val}
              </div>
              <div className="text-[10px] sm:text-xs text-gallery-muted mt-1 uppercase tracking-wider">
                {t.about.stat1Label}
              </div>
            </div>
            <div className="p-3 bg-gallery-stone/30 rounded">
              <div className="font-serif text-2xl sm:text-3xl text-gallery-ink font-medium">
                {t.about.stat2Val}
              </div>
              <div className="text-[10px] sm:text-xs text-gallery-muted mt-1 uppercase tracking-wider">
                {t.about.stat2Label}
              </div>
            </div>
            <div className="p-3 bg-gallery-stone/30 rounded">
              <div className="font-serif text-2xl sm:text-3xl text-gallery-ink font-medium">
                {t.about.stat3Val}
              </div>
              <div className="text-[10px] sm:text-xs text-gallery-muted mt-1 uppercase tracking-wider">
                {t.about.stat3Label}
              </div>
            </div>
            <div className="p-3 bg-gallery-stone/30 rounded">
              <div className="font-serif text-2xl sm:text-3xl text-gallery-ink font-medium">
                {t.about.stat4Val}
              </div>
              <div className="text-[10px] sm:text-xs text-gallery-muted mt-1 uppercase tracking-wider">
                {t.about.stat4Label}
              </div>
            </div>
          </div>
        </div>

        {/* Biography Story Column */}
        <div className="lg:col-span-7 space-y-6 text-base sm:text-lg text-gallery-muted leading-relaxed font-light">
          <p className="text-gallery-ink font-serif text-xl sm:text-2xl leading-snug">
            {t.about.storyP1}
          </p>
          <p>{t.about.storyP2}</p>
          <p>{t.about.storyP3}</p>

          {/* Pull Quote */}
          <div className="relative mt-8 p-6 sm:p-8 bg-gallery-stone/40 border-l-2 border-gallery-ink rounded-r">
            <Quote className="w-8 h-8 text-gallery-muted/30 absolute top-4 right-4" />
            <blockquote className="font-serif italic text-lg sm:text-xl text-gallery-ink leading-relaxed">
              {t.about.quote}
            </blockquote>
            <cite className="block text-xs uppercase tracking-museum text-gallery-muted mt-4 not-italic font-sans">
              {t.about.quoteAuthor}
            </cite>
          </div>
        </div>
      </div>

      {/* Deep-Dive 3 Pillars Section */}
      <div className="border-t border-gallery-border pt-16 sm:pt-20 mb-20 sm:mb-24">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-serif text-2xl sm:text-4xl text-gallery-ink font-medium mb-3">
            {language === 'UA' ? 'Світогляд та традиція' : 'Artistic Pillars & Vision'}
          </h2>
          <p className="text-sm sm:text-base text-gallery-muted font-light">
            {language === 'UA'
              ? 'Три виміри творчості Рустама Жураєва'
              : 'Three founding dimensions of Rustam Zhuraiev’s work'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pillar 1 */}
          <div className="p-8 bg-gallery-stone/20 gallery-card-border space-y-4 hover:bg-gallery-stone/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gallery-stone flex items-center justify-center text-gallery-ink border border-gallery-border/40">
              <Heart className="w-5 h-5 text-gallery-ink" />
            </div>
            <h3 className="font-serif text-xl text-gallery-ink font-medium">
              {t.about.section1Title}
            </h3>
            <p className="text-sm text-gallery-muted leading-relaxed font-light">
              {t.about.section1Text}
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 bg-gallery-stone/20 gallery-card-border space-y-4 hover:bg-gallery-stone/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gallery-stone flex items-center justify-center text-gallery-ink border border-gallery-border/40">
              <Landmark className="w-5 h-5 text-gallery-ink" />
            </div>
            <h3 className="font-serif text-xl text-gallery-ink font-medium">
              {t.about.section2Title}
            </h3>
            <p className="text-sm text-gallery-muted leading-relaxed font-light">
              {t.about.section2Text}
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 bg-gallery-stone/20 gallery-card-border space-y-4 hover:bg-gallery-stone/40 transition-colors">
            <div className="w-10 h-10 rounded-full bg-gallery-stone flex items-center justify-center text-gallery-ink border border-gallery-border/40">
              <MapPin className="w-5 h-5 text-gallery-ink" />
            </div>
            <h3 className="font-serif text-xl text-gallery-ink font-medium">
              {t.about.section3Title}
            </h3>
            <p className="text-sm text-gallery-muted leading-relaxed font-light">
              {t.about.section3Text}
            </p>
          </div>
        </div>
      </div>

      {/* Call to Actions Footer */}
      <div className="bg-gallery-stone/30 gallery-card-border p-8 sm:p-12 text-center space-y-6">
        <h3 className="font-serif text-2xl sm:text-3xl text-gallery-ink font-medium">
          {language === 'UA' ? 'Торкнутися живого каменю' : 'Experience the Living Stone'}
        </h3>
        <p className="text-sm sm:text-base text-gallery-muted max-w-xl mx-auto font-light leading-relaxed">
          {language === 'UA'
            ? 'Ознайомтеся з повною колекцією авторських робіт або зв’яжіться з майстернею для приватного перегляду.'
            : 'Explore the full catalog of original works or reach out to arrange a private studio inquiry.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gallery-ink text-white rounded text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            {t.about.viewWorksBtn}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 border border-gallery-border bg-white text-gallery-ink rounded text-sm font-medium hover:bg-gallery-stone transition-colors"
          >
            {t.about.contactBtn}
          </Link>
        </div>
      </div>
    </div>
  );
};
