import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ArrowRight, ExternalLink, Video, Newspaper, Quote } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t, language } = useLanguage();

  const stats = [
    { val: t.about.stat1Val, label: t.about.stat1Label },
    { val: t.about.stat2Val, label: t.about.stat2Label },
    { val: t.about.stat3Val, label: t.about.stat3Label },
    { val: t.about.stat4Val, label: t.about.stat4Label },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Editorial Header */}
      <div className="max-w-3xl mb-16 space-y-4">
        <div className="text-xs font-semibold uppercase tracking-museum text-gallery-muted">
          {t.about.badge}
        </div>
        <h1 className="font-serif text-4xl sm:text-6xl text-gallery-ink font-medium leading-tight">
          {t.about.title}
        </h1>
        <p className="text-base text-gallery-muted font-light leading-relaxed">
          {t.about.heroSubtitle}
        </p>
      </div>

      {/* Portrait & Biography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-24">
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-[4/5] bg-gallery-stone gallery-card-border overflow-hidden">
            <ImageWithFallback
              src="/author/rustam-zhuraiev.webp"
              fallbackSrc="/sculptures/anhelyk.webp"
              alt={language === 'UA' ? 'Рустам Жураєв — скульптор' : 'Rustam Zhuraiev — sculptor'}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-[12px] text-gallery-muted italic">
            {t.about.photoCaption}
          </p>

          <div className="pt-6 border-t border-gallery-border grid grid-cols-2 gap-4 text-left">
            {stats.map((s) => (
              <div key={s.label} className="p-3 bg-gallery-stone/30 gallery-card-border">
                <div className="font-serif text-2xl text-gallery-ink font-medium">{s.val}</div>
                <div className="text-[11px] text-gallery-muted mt-1 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6 text-sm sm:text-base text-gallery-muted leading-relaxed font-light">
          <p className="text-gallery-ink text-base sm:text-lg leading-relaxed font-normal">
            {t.about.storyP1}
          </p>
          <p>{t.about.storyP2}</p>
          <p>{t.about.storyP3}</p>
        </div>
      </div>

      {/* Exhibition Section: «Першообрази» */}
      <div className="border-t border-gallery-border pt-16 sm:pt-20 mb-24">
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-museum text-gallery-muted">
            {t.about.exhibitionBadge}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-gallery-ink font-medium">
            {t.about.exhibitionTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-7 space-y-6 text-sm sm:text-base text-gallery-muted leading-relaxed font-light">
            <p>{t.about.exhibitionP1}</p>
            <p>{t.about.exhibitionP2}</p>

            {/* Curatorial Quote Callout */}
            <div className="my-8 p-6 sm:p-8 bg-gallery-stone/40 gallery-card-border relative">
              <Quote className="w-8 h-8 text-gallery-ink/15 absolute top-5 right-5" />
              <blockquote className="font-serif text-lg sm:text-xl text-gallery-ink italic leading-snug mb-4">
                {t.about.quoteText}
              </blockquote>
              <div className="text-xs font-semibold uppercase tracking-wider text-gallery-ink">
                — {t.about.quoteAuthor},{' '}
                <span className="font-normal text-gallery-muted lowercase">{t.about.quoteRole}</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-[16/10] bg-gallery-stone gallery-card-border overflow-hidden group">
              <ImageWithFallback
                src="/author/pershoobrazy-exhibition.webp"
                fallbackSrc="/sculptures/anhelyk.webp"
                alt={t.about.exhibitionPhotoCaption}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="text-[12px] text-gallery-muted italic">
              {t.about.exhibitionPhotoCaption}
            </p>

            <div className="aspect-[16/9] bg-gallery-stone gallery-card-border overflow-hidden">
              <ImageWithFallback
                src="/author/pershoobrazy-detail.webp"
                fallbackSrc="/sculptures/anhelyk.webp"
                alt="Фрагмент скульптури з виставки Першообрази"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media & Press Section */}
      <div className="border-t border-gallery-border pt-16 sm:pt-20 mb-24">
        <div className="max-w-3xl mb-12 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-museum text-gallery-muted">
            {t.about.mediaBadge}
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl text-gallery-ink font-medium">
            {t.about.mediaTitle}
          </h2>
          <p className="text-sm sm:text-base text-gallery-muted font-light leading-relaxed">
            {t.about.mediaSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* YouTube Video Card */}
          <a
            href="https://www.youtube.com/watch?v=2qI5Dl5ZJ5o"
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-6 sm:p-8 bg-gallery-stone/30 gallery-card-border hover:bg-gallery-stone/60 hover:border-gallery-ink/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gallery-ink">
                <Video className="w-4 h-4 text-red-600" />
                <span>{t.about.videoBadge}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gallery-muted group-hover:text-gallery-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <h3 className="font-serif text-2xl text-gallery-ink font-medium mb-3 group-hover:text-neutral-950 transition-colors">
              {t.about.videoTitle}
            </h3>
            <p className="text-sm text-gallery-muted font-light leading-relaxed mb-6">
              {t.about.videoDesc}
            </p>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gallery-ink group-hover:underline">
              {t.about.videoAction}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </a>

          {/* RISU Article Card */}
          <a
            href="https://risu.ua/pershoobrazi-u-lvovi-predstavlena-vistavka-skulptur-rustama-zhurayeva_n165335"
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-6 sm:p-8 bg-gallery-stone/30 gallery-card-border hover:bg-gallery-stone/60 hover:border-gallery-ink/30 transition-all"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gallery-ink">
                <Newspaper className="w-4 h-4 text-amber-700" />
                <span>{t.about.articleBadge}</span>
              </div>
              <ExternalLink className="w-4 h-4 text-gallery-muted group-hover:text-gallery-ink group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <h3 className="font-serif text-2xl text-gallery-ink font-medium mb-3 group-hover:text-neutral-950 transition-colors">
              {t.about.articleTitle}
            </h3>
            <p className="text-sm text-gallery-muted font-light leading-relaxed mb-6">
              {t.about.articleDesc}
            </p>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gallery-ink group-hover:underline">
              {t.about.articleAction}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="p-8 sm:p-12 bg-gallery-stone/30 gallery-card-border text-center space-y-6">
        <h2 className="font-serif text-3xl sm:text-4xl text-gallery-ink font-medium">
          {t.about.ctaTitle}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 text-sm px-6 py-3 rounded-sm font-medium tracking-wide bg-gallery-ink text-gallery-milk hover:bg-neutral-800 shadow-subtle transition-all"
          >
            {t.about.viewWorksBtn}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center text-sm px-6 py-3 rounded-sm font-medium tracking-wide bg-transparent text-gallery-ink border border-gallery-ink hover:bg-gallery-ink hover:text-gallery-milk transition-all"
          >
            {t.about.contactBtn}
          </Link>
        </div>
      </div>
    </div>
  );
};
