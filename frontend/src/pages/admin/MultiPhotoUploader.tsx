import React, { useState, useRef } from 'react';
import { Upload, Star, Trash2, ArrowUp, ArrowDown, Image as ImageIcon, Loader2 } from 'lucide-react';
import { PhotoItem } from '../../types';
import { optimizeImageToWebP } from '../../services/imageOptimizer';
import { getPresignedUploadUrl, uploadImageDirectToS3 } from '../../services/api';

interface MultiPhotoUploaderProps {
  photos: PhotoItem[];
  onChange: (photos: PhotoItem[]) => void;
}

export const MultiPhotoUploader: React.FC<MultiPhotoUploaderProps> = ({ photos, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const updatedList = [...photos];

    try {
      for (let i = 0; i < files.length; i++) {
        const originalFile = files[i];
        setUploadProgressText(`Оптимізація ${i + 1}/${files.length}: ${originalFile.name}...`);

        // 1. Client-Side WebP Conversion via HTML5 Canvas
        const optimized = await optimizeImageToWebP(originalFile, 2400, 0.86);

        setUploadProgressText(`Завантаження в S3 ${i + 1}/${files.length} (-${optimized.compressionRatio}% розміру)...`);

        // 2. Request S3 Presigned URL from Backend API
        const presigned = await getPresignedUploadUrl(optimized.file.name, 'image/webp');

        // 3. Direct PUT upload to S3 / CloudFront
        await uploadImageDirectToS3(presigned.upload_url, optimized.blob, 'image/webp');

        // 4. Append to photo items
        const isFirst = updatedList.length === 0;
        updatedList.push({
          url: presigned.public_url,
          alt_ua: originalFile.name.replace(/\.[^/.]+$/, ''),
          alt_en: originalFile.name.replace(/\.[^/.]+$/, ''),
          is_cover: isFirst,
          display_order: updatedList.length,
          width: optimized.width,
          height: optimized.height,
        });
      }

      onChange(updatedList);
    } catch (err: any) {
      console.error('Upload failed:', err);
      alert(`Помилка завантаження: ${err.message || 'Не вдалося завантажити фото'}`);
    } finally {
      setIsProcessing(false);
      setUploadProgressText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetCover = (index: number) => {
    const updated = photos.map((p, idx) => ({
      ...p,
      is_cover: idx === index,
    }));
    onChange(updated);
  };

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, idx) => idx !== index);
    // If the cover was removed, make the first remaining image cover
    if (updated.length > 0 && !updated.some((p) => p.is_cover)) {
      updated[0].is_cover = true;
    }
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= photos.length) return;

    const copy = [...photos];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    // Update display_order
    copy.forEach((item, idx) => {
      item.display_order = idx;
    });

    onChange(copy);
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Upload Dropzone */}
      <div
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!isProcessing) handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed border-gallery-border hover:border-gallery-ink p-8 text-center rounded bg-gallery-stone/30 cursor-pointer transition-colors ${
          isProcessing ? 'opacity-60 cursor-not-allowed' : ''
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-gallery-ink" />
            <p className="text-xs text-gallery-ink font-medium">{uploadProgressText}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="w-8 h-8 text-gallery-muted" />
            <p className="text-xs sm:text-sm font-medium text-gallery-ink">
              Перетягніть фотографії сюди або натисніть для вибору
            </p>
            <p className="text-[11px] text-gallery-muted max-w-sm">
              JPEG, PNG, WebP. Автоматичне стиснення в WebP у браузері та пряме завантаження в S3.
            </p>
          </div>
        )}
      </div>

      {/* Uploaded Photos Grid with Reordering & Cover controls */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className={`relative aspect-[4/5] bg-gallery-stone border rounded overflow-hidden group transition-all ${
                photo.is_cover ? 'border-gallery-ink ring-2 ring-gallery-ink/20' : 'border-gallery-border'
              }`}
            >
              <img
                src={photo.url}
                alt={photo.alt_ua || `Photo ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Cover badge */}
              {photo.is_cover && (
                <div className="absolute top-2 left-2 z-10 bg-gallery-ink text-gallery-milk text-[10px] font-semibold px-2 py-0.5 rounded shadow">
                  Головне фото
                </div>
              )}

              {/* Control overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => handleSetCover(idx)}
                    title="Зробити головним"
                    className={`p-1.5 rounded transition-colors ${
                      photo.is_cover ? 'text-amber-400' : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <Star className="w-4 h-4 fill-current" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Видалити"
                    className="p-1.5 rounded text-white/80 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Move buttons */}
                <div className="flex justify-center space-x-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, 'up')}
                    className="p-1 rounded bg-black/40 hover:bg-black/80 disabled:opacity-30"
                    title="Посунути лівіше"
                  >
                    <ArrowUp className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === photos.length - 1}
                    onClick={() => handleMove(idx, 'down')}
                    className="p-1 rounded bg-black/40 hover:bg-black/80 disabled:opacity-30"
                    title="Посунути правіше"
                  >
                    <ArrowDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
