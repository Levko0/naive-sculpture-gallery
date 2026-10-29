import React from 'react';
import { Link } from 'react-router-dom';
import { Sculpture } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { StatusBadge } from '../common/Badge';
import { ImageWithFallback } from '../common/ImageWithFallback';

interface SculptureCardProps {
  sculpture: Sculpture;
}

export const SculptureCard: React.FC<SculptureCardProps> = ({ sculpture }) => {
  const { language } = useLanguage();

  const title = language === 'UA' ? sculpture.title_ua : sculpture.title_en;
  const material = language === 'UA' ? sculpture.material_ua : sculpture.material_en;
  const coverPhoto =
    sculpture.photos.find((p) => p.is_cover)?.url ||
    sculpture.photos[0]?.url ||
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1200&q=85';

  const { height_cm, width_cm, depth_cm } = sculpture.dimensions;

  return (
    <article className="group flex flex-col bg-gallery-stone/30 gallery-card-border p-4 transition-all duration-300 hover:shadow-subtle hover:bg-gallery-stone/60">
      <Link
        to={`/sculpture/${sculpture.slug}`}
        className="block relative aspect-[4/5] overflow-hidden bg-gallery-stone"
      >
        <ImageWithFallback
          src={coverPhoto}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Floating status badge */}
        <div className="absolute top-3 right-3 z-10">
          <StatusBadge status={sculpture.status} size="sm" />
        </div>
      </Link>

      {/* Metadata caption area */}
      <div className="pt-4 flex flex-col flex-grow justify-between">
        <div>
          <div className="flex justify-between items-baseline gap-2 mb-1">
            <h3 className="font-serif text-xl sm:text-2xl text-gallery-ink font-medium leading-tight group-hover:text-neutral-600 transition-colors">
              <Link to={`/sculpture/${sculpture.slug}`}>{title}</Link>
            </h3>
            <span className="text-xs text-gallery-muted font-sans tabular-nums shrink-0">
              {sculpture.year}
            </span>
          </div>

          <p className="text-xs text-gallery-muted line-clamp-1 mb-3 font-sans">
            {material}
          </p>
        </div>

        {/* Footer row: Dimensions & Price */}
        <div className="pt-3 border-t border-gallery-border/40 flex items-center justify-between text-xs">
          <div className="text-gallery-muted tabular-nums">
            {height_cm} × {width_cm} × {depth_cm} cm
          </div>

          <div className="font-medium text-gallery-ink tabular-nums text-sm">
            {sculpture.status === 'SOLD' ? (
              <span className="text-gallery-muted italic">Продано</span>
            ) : (
              <span>{sculpture.price_uah.toLocaleString()} ₴</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
