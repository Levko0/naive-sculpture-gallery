import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sculpture } from '../types';
import { fetchSculptures, getLocalSculptures } from '../services/api';
import { SculptureGrid } from '../components/gallery/SculptureGrid';
import { SEO } from '../components/common/SEO';

export const ArchivePage: React.FC = () => {
  const { t, language } = useLanguage();
  const [sculptures, setSculptures] = useState<Sculpture[]>(() =>
    getLocalSculptures().filter((s) => s.status === 'SOLD')
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSculptures('SOLD', undefined, true)
      .then((data: Sculpture[]) => {
        setSculptures(data);
        setIsLoading(false);
      })
      .catch((err: any) => {
        console.error('Failed to load archive sculptures:', err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <SEO
        title={language === 'UA' ? "Колекційний архів робіт | Рустам Жураєв" : "Collection Archive | Rustam Zhuraiev"}
        description={language === 'UA'
          ? "Архів кам'яних скульптур Рустама Жураєва, що знайшли свій дім у приватних колекціях. Можливість замовити авторську варіацію твору."
          : "Archive of naive stone sculptures by Rustam Zhuraiev now housed in private collections. Custom commissions available."}
        url="/archive"
      />
      <div className="max-w-3xl mb-12 space-y-4">
        <div className="text-xs font-semibold uppercase tracking-museum text-gallery-muted">
          Колекційний архів
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-gallery-ink font-medium leading-tight">
          {t.nav.archive}
        </h1>
        <p className="text-sm text-gallery-muted leading-relaxed font-light">
          Роботи, що знайшли свій дім у приватних колекціях України, Європи та світу.
          Якщо вам сподобалася певна форма чи персонаж із архіву, ви можете надіслати запит автору на створення схожої авторської скульптури на замовлення.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="font-serif text-2xl text-gallery-ink font-normal">
          {language === 'UA' ? 'Твори у приватних колекціях' : 'Works in Private Collections'}
        </h2>
      </div>

      <SculptureGrid sculptures={sculptures} isLoading={isLoading} />
    </div>
  );
};
