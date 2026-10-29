import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Sculpture, SculptureInput, SculptureStatus, PhotoItem } from '../../types';
import { MultiPhotoUploader } from './MultiPhotoUploader';
import { Button } from '../../components/common/Button';

interface SculptureEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sculpture?: Sculpture | null;
  onSave: (data: SculptureInput) => Promise<void>;
}

export const SculptureEditorModal: React.FC<SculptureEditorModalProps> = ({
  isOpen,
  onClose,
  sculpture,
  onSave,
}) => {
  const isEditing = !!sculpture;

  const [titleUa, setTitleUa] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [slug, setSlug] = useState('');
  const [storyUa, setStoryUa] = useState('');
  const [storyEn, setStoryEn] = useState('');
  const [materialUa, setMaterialUa] = useState('Шамотна глина, ангоби');
  const [materialEn, setMaterialEn] = useState('Chamotte clay, raw engobes');
  const [techniqueUa, setTechniqueUa] = useState('Ручне ліплення, випал 1050°C, вощіння');
  const [techniqueEn, setTechniqueEn] = useState('Hand-sculpted, fired at 1050°C, beeswax');
  const [year, setYear] = useState(new Date().getFullYear());
  const [priceUah, setPriceUah] = useState(18000);
  const [priceEur, setPriceEur] = useState<number | undefined>(420);
  const [priceUsd, setPriceUsd] = useState<number | undefined>(460);
  const [heightCm, setHeightCm] = useState(30);
  const [widthCm, setWidthCm] = useState(20);
  const [depthCm, setDepthCm] = useState(18);
  const [weightKg, setWeightKg] = useState(4.5);
  const [status, setStatus] = useState<SculptureStatus>('AVAILABLE');
  const [displayOrder, setDisplayOrder] = useState(1);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sculpture) {
      setTitleUa(sculpture.title_ua);
      setTitleEn(sculpture.title_en);
      setSlug(sculpture.slug);
      setStoryUa(sculpture.story_ua);
      setStoryEn(sculpture.story_en);
      setMaterialUa(sculpture.material_ua);
      setMaterialEn(sculpture.material_en);
      setTechniqueUa(sculpture.technique_ua);
      setTechniqueEn(sculpture.technique_en);
      setYear(sculpture.year);
      setPriceUah(sculpture.price_uah);
      setPriceEur(sculpture.price_eur);
      setPriceUsd(sculpture.price_usd);
      setHeightCm(sculpture.dimensions.height_cm);
      setWidthCm(sculpture.dimensions.width_cm);
      setDepthCm(sculpture.dimensions.depth_cm);
      setWeightKg(sculpture.dimensions.weight_kg);
      setStatus(sculpture.status);
      setDisplayOrder(sculpture.display_order);
      setPhotos(sculpture.photos || []);
    } else {
      // Reset
      setTitleUa('');
      setTitleEn('');
      setSlug('');
      setStoryUa('');
      setStoryEn('');
      setPhotos([]);
      setStatus('AVAILABLE');
    }
  }, [sculpture, isOpen]);

  // Auto-generate slug from English title if empty
  const handleTitleEnChange = (val: string) => {
    setTitleEn(val);
    if (!isEditing && (!slug || slug === titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(generated);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!titleUa.trim() || !titleEn.trim()) {
      setError('Вкажіть назву українською та англійською мовами.');
      return;
    }
    if (!slug.trim()) {
      setError('Вкажіть унікальний slug (URL).');
      return;
    }
    if (photos.length === 0) {
      setError('Додайте принаймні одну фотографію скульптури.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        title_ua: titleUa.trim(),
        title_en: titleEn.trim(),
        slug: slug.trim().toLowerCase(),
        story_ua: storyUa.trim(),
        story_en: storyEn.trim(),
        material_ua: materialUa.trim(),
        material_en: materialEn.trim(),
        technique_ua: techniqueUa.trim(),
        technique_en: techniqueEn.trim(),
        year: Number(year),
        edition_ua: 'Єдиний екземпляр (1/1)',
        edition_en: 'Unique original (1/1)',
        price_uah: Number(priceUah),
        price_eur: priceEur ? Number(priceEur) : undefined,
        price_usd: priceUsd ? Number(priceUsd) : undefined,
        dimensions: {
          height_cm: Number(heightCm),
          width_cm: Number(widthCm),
          depth_cm: Number(depthCm),
          weight_kg: Number(weightKg),
        },
        photos,
        status,
        display_order: Number(displayOrder),
        is_featured: false,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Помилка збереження скульптури');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl bg-gallery-milk gallery-card-border shadow-elevation p-6 sm:p-10 text-gallery-ink max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-gallery-muted hover:text-gallery-ink transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h2 className="font-serif text-3xl font-medium">
            {isEditing ? 'Редагування скульптури' : 'Додати нову скульптуру'}
          </h2>
          <p className="text-xs text-gallery-muted mt-1">
            Заповніть метадані, паспорт твору та завантажте фотографії
          </p>
        </div>

        {error && (
          <div className="p-3 mb-6 rounded bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos Uploader */}
          <div className="p-4 bg-gallery-stone/40 border border-gallery-border rounded space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink">
              Фотографії скульптури (WebP в S3) <span className="text-red-500">*</span>
            </label>
            <MultiPhotoUploader photos={photos} onChange={setPhotos} />
          </div>

          {/* Titles & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Назва (UA) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={titleUa}
                onChange={(e) => setTitleUa(e.target.value)}
                placeholder="Звір-Охоронець Саду"
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Title (EN) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={titleEn}
                onChange={(e) => handleTitleEnChange(e.target.value)}
                placeholder="Garden Guardian Beast"
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink"
              />
            </div>
          </div>

          {/* Slug & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Slug (URL адреса) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="garden-guardian-beast"
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Статус доступності
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SculptureStatus)}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink"
              >
                <option value="AVAILABLE">В наявності (AVAILABLE)</option>
                <option value="RESERVED">Заброньовано (RESERVED)</option>
                <option value="SOLD">Продано / Архів (SOLD)</option>
              </select>
            </div>
          </div>

          {/* Prices & Year */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Ціна (₴ UAH) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                value={priceUah}
                onChange={(e) => setPriceUah(Number(e.target.value))}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Ціна (€ EUR)
              </label>
              <input
                type="number"
                value={priceEur || ''}
                onChange={(e) => setPriceEur(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Рік
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Порядок показу
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink tabular-nums"
              />
            </div>
          </div>

          {/* Physical Dimensions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Висота (см)
              </label>
              <input
                type="number"
                step="0.5"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Ширина (см)
              </label>
              <input
                type="number"
                step="0.5"
                value={widthCm}
                onChange={(e) => setWidthCm(Number(e.target.value))}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Глибина (см)
              </label>
              <input
                type="number"
                step="0.5"
                value={depthCm}
                onChange={(e) => setDepthCm(Number(e.target.value))}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Вага (кг)
              </label>
              <input
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink tabular-nums"
              />
            </div>
          </div>

          {/* Materials & Techniques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Матеріал (UA)
              </label>
              <input
                type="text"
                value={materialUa}
                onChange={(e) => setMaterialUa(e.target.value)}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Material (EN)
              </label>
              <input
                type="text"
                value={materialEn}
                onChange={(e) => setMaterialEn(e.target.value)}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink"
              />
            </div>
          </div>

          {/* Stories */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Історія та концепція образу (UA)
              </label>
              <textarea
                rows={3}
                value={storyUa}
                onChange={(e) => setStoryUa(e.target.value)}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gallery-ink mb-1">
                Story & Concept (EN)
              </label>
              <textarea
                rows={3}
                value={storyEn}
                onChange={(e) => setStoryEn(e.target.value)}
                className="w-full text-sm bg-gallery-milk border border-gallery-border rounded px-3 py-2 text-gallery-ink"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-gallery-border">
            <Button type="button" variant="ghost" onClick={onClose}>
              Скасувати
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              <span className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Зберегти скульптуру</span>
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
