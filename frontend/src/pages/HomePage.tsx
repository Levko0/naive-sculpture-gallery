import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sculpture } from '../types';
import { fetchSculptures, getLocalSculptures } from '../services/api';
import { SculptureGrid } from '../components/gallery/SculptureGrid';
import { FilterBar } from '../components/gallery/FilterBar';
import { SEO } from '../components/common/SEO';
import { ArrowDown } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { t, language } = useLanguage();

  const [sculptures, setSculptures] = useState<Sculpture[]>(() => getLocalSculptures());
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [materialFilter, setMaterialFilter] = useState('');

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Рустам Жураєв",
    "jobTitle": language === 'UA' ? 'Скульптор' : 'Sculptor',
    "description": language === 'UA'
      ? "Скульптор у традиції українського наївного мистецтва. Оригінальна авторська кам'яна пластика ручної роботи (1/1)."
      : "Ukrainian naive art sculptor. Original handcrafted stone sculptures (1/1 edition).",
    "url": "/",
    "sameAs": [
      "https://t.me/zhsculptures",
      "https://www.youtube.com/watch?v=2qI5Dl5ZJ5o"
    ]
  };

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetchSculptures(statusFilter || undefined, materialFilter || undefined, true)
      .then((data: Sculpture[]) => {
        if (isMounted) {
          setSculptures(data);
          setIsLoading(false);
        }
      })
      .catch((err: any) => {
        console.error('Failed to load sculptures:', err);
        if (isMounted) setIsLoading(false);
      });

  return () => {
      isMounted = false;
    };
  }, [statusFilter, materialFilter]);

  const scrollToCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen">
      <SEO
        title={language === 'UA' ? "Рустам Жураєв | Галерея наївної кам'яної скульптури" : "Rustam Zhuraiev | Naive Stone Sculpture Gallery"}
        description={language === 'UA'
          ? "Онлайн-галерея оригінальних кам'яних скульптур Рустама Жураєва у традиції українського наїву. Пісковик, мармур, базальт, габро — унікальні екземпляри (1/1)."
          : "Online gallery of original handcrafted naive stone sculptures by Rustam Zhuraiev. Sandstone, marble, basalt, gabbro — unique pieces (1/1)."}
        url="/"
        image="/sculptures/anhelyk.webp"
        jsonLd={personJsonLd}
      />
      {/* ==================================================================== */}
      {/* HERO SECTION: "LIGHT MUSEUM MINIMALISM" WITH PLENTY OF BREATHING ROOM */}
      {/* ==================================================================== */}
      <section className="relative pt-20 pb-28 sm:pt-28 sm:pb-36 border-b border-gallery-border/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Subtle museum badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gallery-stone border border-gallery-border text-xs text-gallery-muted tracking-museum uppercase">
            <span>{t.hero.philosophyBadge}</span>
          </div>

          {/* Editorial Display Heading */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl text-gallery-ink font-normal tracking-tight leading-[1.08] max-w-4xl mx-auto">
            {t.hero.title}
          </h1>

          {/* Subtitle & Curatorial Statement */}
          <p className="font-sans text-base sm:text-lg text-gallery-muted max-w-2xl mx-auto leading-relaxed font-light">
            {t.hero.description}
          </p>

          {/* Quiet CTA to explore catalog */}
          <div className="pt-6">
            <button
              type="button"
              onClick={scrollToCatalog}
              aria-label={t.hero.viewCatalog}
              className="inline-flex items-center min-h-[44px] space-x-2 text-xs font-semibold uppercase tracking-museum text-gallery-ink hover:text-neutral-600 transition-colors py-2.5 px-4 border-b border-gallery-ink"
            >
              <span>{t.hero.viewCatalog}</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* CATALOG GALLERY SECTION */}
      {/* ==================================================================== */}
      <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-4">
          <h2 className="font-serif text-2xl sm:text-3xl text-gallery-ink font-normal tracking-tight">
            {language === 'UA' ? 'Колекція наявних робіт' : 'Available Collection'}
          </h2>
        </div>

        <FilterBar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          materialFilter={materialFilter}
          onMaterialChange={setMaterialFilter}
          totalCount={sculptures.length}
        />

        <SculptureGrid sculptures={sculptures} isLoading={isLoading} />
      </section>
    </div>
  );
};
