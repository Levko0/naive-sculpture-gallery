import React from 'react';
import { SculptureStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface BadgeProps {
  status: SculptureStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const { t } = useLanguage();

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  if (status === 'AVAILABLE') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-badge-greenBg text-badge-green border border-[#D5E6D8] tracking-wide ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-badge-green mr-1.5 animate-pulse" />
        {t.sculpture.available}
      </span>
    );
  }

  if (status === 'RESERVED') {
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full bg-badge-ochreBg text-badge-ochre border border-[#F3E3CD] tracking-wide ${sizeClasses}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-badge-ochre mr-1.5" />
        {t.sculpture.reserved}
      </span>
    );
  }

  // SOLD
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full bg-badge-soldBg text-badge-sold border border-[#E4DFDF] tracking-wide ${sizeClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-badge-sold mr-1.5" />
      {t.sculpture.sold}
    </span>
  );
};
