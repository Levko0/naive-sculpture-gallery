import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { Sculpture, PhotoItem } from '../types';
import { fetchSculptureBySlug } from '../services/api';
import { StatusBadge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Lightbox } from '../components/gallery/Lightbox';
import { AcquisitionModal } from '../components/order/AcquisitionModal';
import { ImageWithFallback } from '../components/common/ImageWithFallback';
import { ZoomIn, ArrowLeft, ShieldCheck, Truck, Sparkles } from 'lucide-react';

export const SculptureDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language, t } = useLanguage();

  const [sculpture, setSculpture] = useState<Sculpture | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Acquisition Modal state
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);

    fetchSculptureBySlug(slug)
      .then((data: Sculpture) => {
        setSculpture(data);
        setIsLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || 'Скульптуру не знайдено');
        setIsLoading(false);
      });
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-6 w-32 bg-gallery-stone rounded" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 aspect-[4/5] bg-gallery-stone rounded" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-10 w-3/4 bg-gallery-stone rounded" />
            <div className="h-6 w-1/3 bg-gallery-stone rounded" />
            <div className="h-32 bg-gallery-stone rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !sculpture) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-28 text-center space-y-6">
        <h2 className="font-serif text-3xl text-gallery-ink">Скульптуру не знайдено</h2>
        <p className="text-sm text-gallery-muted">
          Можливо, твір було переміщено або посилання застаріло.
        </p>
        <div>
          <Link to="/" className="inline-flex items-center text-xs font-semibold uppercase tracking-museum border-b border-gallery-ink pb-1">
            {t.sculpture.backToWorks}
          </Link>
        </div>
      </div>
    );
  }

  const title = language === 'UA' ? sculpture.title_ua : sculpture.title_en;
  const story = language === 'UA' ? sculpture.story_ua : sculpture.story_en;
  const material = language === 'UA' ? sculpture.material_ua : sculpture.material_en;
  const technique = language === 'UA' ? sculpture.technique_ua : sculpture.technique_en;
  const edition = language === 'UA' ? sculpture.edition_ua : sculpture.edition_en;

  const isAvailable = sculpture.status === 'AVAILABLE';
  const isInquiryAction = !isAvailable;

  const openLightboxAt = (idx: number) => {
    setActivePhotoIndex(idx);
    setIsLightboxOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb / Back button */}
      <div className="mb-8">
        <Link
          to="/"
          className="inline-flex items-center text-xs text-gallery-muted hover:text-gallery-ink transition-colors tracking-wide space-x-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t.sculpture.backToWorks}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* ================================================================== */}
        {/* LEFT COLUMN: MULTI-ANGLE VERTICAL GALLERY & LIGHTBOX TRIGGER */}
        {/* ================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Primary View */}
          <div
            className="relative aspect-[4/5] bg-gallery-stone/40 gallery-card-border overflow-hidden cursor-zoom-in group"
            onClick={() => openLightboxAt(0)}
          >
            <ImageWithFallback
              src={sculpture.photos[0]?.url}
              alt={sculpture.photos[0]?.alt_ua || title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
            />
            {/* Zoom Hint Overlay */}
            <div className="absolute bottom-4 right-4 bg-gallery-ink/80 backdrop-blur-sm text-gallery-milk p-2.5 rounded-full shadow-md opacity-90 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>

          {/* Secondary angles gallery strip */}
          {sculpture.photos.length > 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {sculpture.photos.slice(1).map((photo: PhotoItem, idx: number) => (
                <div
                  key={idx + 1}
                  className="relative aspect-square bg-gallery-stone/40 gallery-card-border overflow-hidden cursor-zoom-in group"
                  onClick={() => openLightboxAt(idx + 1)}
                >
                  <ImageWithFallback
                    src={photo.url}
                    alt={photo.alt_ua || `${title} angle ${idx + 2}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gallery-ink/0 group-hover:bg-gallery-ink/10 transition-colors flex items-center justify-center">
                    <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-90 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="text-[11px] text-gallery-muted italic text-center sm:text-left">
            {t.sculpture.lightboxHint}
          </p>
        </div>

        {/* ================================================================== */}
        {/* RIGHT COLUMN: MUSEUM LABEL BLOCK & ACQUISITION ACTION */}
        {/* ================================================================== */}
        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-28">
          {/* Title & Status */}
          <div className="space-y-3 pb-6 border-b border-gallery-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-museum text-gallery-muted">
                {edition}
              </span>
              <StatusBadge status={sculpture.status} size="md" />
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-gallery-ink font-medium leading-[1.12]">
              {title}
            </h1>

            <div className="flex items-baseline space-x-3 pt-1">
              <span className="text-2xl sm:text-3xl font-medium text-gallery-ink tabular-nums">
                {sculpture.price_uah.toLocaleString()} ₴
              </span>
              {sculpture.price_eur && (
                <span className="text-sm text-gallery-muted tabular-nums">
                  (~{sculpture.price_eur} € / ${sculpture.price_usd})
                </span>
              )}
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="space-y-3">
            {isAvailable ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setIsOrderModalOpen(true)}
              >
                <span className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{t.sculpture.acquireBtn}</span>
                </span>
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-gallery-stone border border-gallery-border text-xs text-gallery-muted">
                  {sculpture.status === 'RESERVED'
                    ? t.sculpture.reservedNotice
                    : t.sculpture.soldNotice}
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => setIsOrderModalOpen(true)}
                >
                  {t.sculpture.inquireBtn}
                </Button>
              </div>
            )}
            <p className="text-[11px] text-gallery-muted text-center leading-normal">
              Пряме узгодження з автором без посередників • Оплата на картку
            </p>
          </div>

          {/* Museum Label Specifications Table */}
          <div className="pt-4 border-t border-gallery-border space-y-4">
            <div className="text-xs uppercase tracking-museum font-semibold text-gallery-ink">
              Паспорт твору
            </div>

            <dl className="grid grid-cols-2 gap-y-3.5 text-xs text-gallery-ink">
              <dt className="text-gallery-muted font-normal">{t.sculpture.year}</dt>
              <dd className="tabular-nums font-medium text-right sm:text-left">{sculpture.year}</dd>

              <dt className="text-gallery-muted font-normal">{t.sculpture.dimensions}</dt>
              <dd className="tabular-nums font-medium text-right sm:text-left">
                {sculpture.dimensions.height_cm} × {sculpture.dimensions.width_cm} × {sculpture.dimensions.depth_cm} cm
              </dd>

              <dt className="text-gallery-muted font-normal">{t.sculpture.weight}</dt>
              <dd className="tabular-nums font-medium text-right sm:text-left">
                {sculpture.dimensions.weight_kg} kg
              </dd>

              <dt className="text-gallery-muted font-normal">{t.sculpture.material}</dt>
              <dd className="font-medium text-right sm:text-left">{material}</dd>

              <dt className="text-gallery-muted font-normal">{t.sculpture.technique}</dt>
              <dd className="font-medium text-right sm:text-left">{technique}</dd>
            </dl>
          </div>

          {/* Artist Story / Concept */}
          <div className="pt-6 border-t border-gallery-border space-y-2">
            <div className="text-xs uppercase tracking-museum font-semibold text-gallery-ink">
              {t.sculpture.story}
            </div>
            <p className="text-xs sm:text-sm text-gallery-muted leading-relaxed font-light font-sans">
              {story}
            </p>
          </div>

          {/* Delivery & Authenticity Guarantees */}
          <div className="p-4 bg-gallery-stone/40 border border-gallery-border/70 rounded space-y-3 text-xs text-gallery-muted">
            <div className="flex items-start space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-gallery-ink shrink-0 mt-0.5" />
              <span>
                <strong>100% Авторський оригінал:</strong> Робота супроводжується підписаним сертифікатом автентичності від автора.
              </span>
            </div>
            <div className="flex items-start space-x-2.5">
              <Truck className="w-4 h-4 text-gallery-ink shrink-0 mt-0.5" />
              <span>
                <strong>Надійне пакування:</strong> Спеціальний ударостійкий короб із м'яким ложементом. Страхування перевезення.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <Lightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        photos={sculpture.photos}
        initialIndex={activePhotoIndex}
        sculptureTitle={title}
      />

      {/* Acquisition / Reservation Modal */}
      <AcquisitionModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        sculpture={sculpture}
        isInquiry={isInquiryAction}
        onSuccess={() => {
          if (!isInquiryAction) {
            setSculpture({ ...sculpture, status: 'RESERVED' });
          }
        }}
      />
    </div>
  );
};
