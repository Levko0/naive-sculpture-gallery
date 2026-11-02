import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ArrowRight, Landmark, Stethoscope, MapPin } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { t, language } = useLanguage();

  const stats = [
    { val: t.about.stat1Val, label: t.about.stat1Label },
    { val: t.about.stat2Val, label: t.about.stat2Label },
    { val: t.about.stat3Val, label: t.about.stat3Label },
    { val: t.about.stat4Val, label: t.about.stat4Label },
  ];

  const pillars = [
    { icon: Stethoscope, title: t.about.section1Title, text: t.about.section1Text },
    { icon: Landmark, title: t.about.section2Title, text: t.about.section2Text },
    { icon: MapPin, title: t.about.section3Title, text: t.about.section3Text },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      {/* Editorial Header — same pattern as Archive / Contact */}
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-20">
        <div className="lg:col-span-5 space-y-3">
          <div className="aspect-[4/5] bg-gallery-stone gallery-card-border overflow-hidden">
            <ImageWithFallback
              src="/author/rustam-zhuraiev.webp"
              fallbackSrc="/sculptures/anhelyk.webp"
              alt={language === 'UA' ? 'Рустам Жураєв — скульптор' : 'Rustam Zhuraiev — sculptor'}
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-[11px] text-gallery-muted italic">
            {language === 'UA' ? 'Рустам Жураєв, Львів' : 'Rustam Zhuraiev, Lviv'}
          </p>
        </div>

        <div className="lg:col-span-7 space-y-6 text-sm sm:text-base text-gallery-muted leading-relaxed font-light">
          <p>{t.about.storyP1}</p>
          <p>{t.about.storyP2}</p>
          <p>{t.about.storyP3}</p>

          <div className="pt-6 border-t border-gallery-border grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-serif text-3xl text-gallery-ink font-medium">{s.val}</div>
                <div className="text-xs text-gallery-muted mt-1 uppercase tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Three pillars */}
      <div className="border-t border-gallery-border pt-16 mb-20">
        <div className="text-xs font-semibold uppercase tracking-museum text-gallery-muted mb-8">
          {language === 'UA' ? 'Світогляд та традиція' : 'Vision & Tradition'}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="p-6 bg-gallery-stone/30 gallery-card-border space-y-4">
              <div className="flex items-center space-x-3 text-gallery-ink">
                <Icon className="w-5 h-5" />
                <h3 className="font-serif text-2xl font-medium">{title}</h3>
              </div>
              <p className="text-sm text-gallery-muted leading-relaxed font-light">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="p-8 sm:p-12 bg-gallery-stone/30 gallery-card-border text-center space-y-6">
        <h2 className="font-serif text-3xl text-gallery-ink font-medium">
          {language === 'UA' ? 'Торкнутися живого каменю' : 'Experience the Living Stone'}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 text-sm px-5 py-2.5 rounded-sm font-medium tracking-wide bg-gallery-ink text-gallery-milk hover:bg-neutral-800 shadow-subtle transition-all"
          >
            {t.about.viewWorksBtn}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center text-sm px-5 py-2.5 rounded-sm font-medium tracking-wide bg-transparent text-gallery-ink border border-gallery-ink hover:bg-gallery-ink hover:text-gallery-milk transition-all"
          >
            {t.about.contactBtn}
          </Link>
        </div>
      </div>
    </div>
  );
};
