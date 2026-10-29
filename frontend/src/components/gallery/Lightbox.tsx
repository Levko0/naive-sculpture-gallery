import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { PhotoItem } from '../../types';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  photos: PhotoItem[];
  initialIndex?: number;
  sculptureTitle?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  photos,
  initialIndex = 0,
  sculptureTitle = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  }, [photos.length]);

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  }, [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 text-white select-none backdrop-blur-md">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between p-4 sm:p-6 z-10">
        <div className="text-sm font-sans tracking-wide text-neutral-300">
          <span className="font-serif text-lg text-white mr-3">{sculptureTitle}</span>
          <span className="tabular-nums">
            {currentIndex + 1} / {photos.length}
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title={isZoomed ? 'Зменшити' : 'Збільшити текстуру'}
            aria-label="Toggle zoom"
          >
            {isZoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            title="Закрити (Esc)"
            aria-label="Close lightbox"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-8">
        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute left-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all backdrop-blur-sm"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute right-4 z-20 p-3 rounded-full bg-black/40 hover:bg-black/70 text-white transition-all backdrop-blur-sm"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image with zoom toggle */}
        <div
          className={`relative max-w-full max-h-full transition-transform duration-300 ease-out cursor-pointer ${
            isZoomed ? 'scale-150 sm:scale-175 cursor-zoom-out' : 'cursor-zoom-in'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <img
            src={currentPhoto.url}
            alt={currentPhoto.alt_ua || sculptureTitle}
            className="max-h-[78vh] max-w-[90vw] object-contain rounded-sm shadow-2xl"
          />
        </div>
      </div>

      {/* Bottom Thumbnail Strip */}
      {photos.length > 1 && (
        <div className="flex items-center justify-center space-x-3 p-4 overflow-x-auto z-10">
          {photos.map((photo, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentIndex(idx);
                setIsZoomed(false);
              }}
              className={`relative w-14 h-14 rounded overflow-hidden border-2 transition-all ${
                currentIndex === idx
                  ? 'border-white scale-105 opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <img
                src={photo.url}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
