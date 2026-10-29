import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface FilterBarProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  materialFilter: string;
  onMaterialChange: (material: string) => void;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  onStatusChange,
  materialFilter,
  onMaterialChange,
  totalCount,
}) => {
  const { t } = useLanguage();

  const statusOptions = [
    { id: '', label: t.filter.all },
    { id: 'AVAILABLE', label: t.filter.available },
    { id: 'SOLD', label: t.filter.sold },
  ];

  const materialOptions = [
    { id: '', label: t.filter.allMaterials },
    { id: 'шамот', label: t.filter.chamotte },
    { id: 'глина', label: t.filter.clay },
    { id: 'дерево', label: t.filter.wood },
    { id: 'змішана', label: t.filter.mixed },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-b border-gallery-border mb-8">
      {/* Status Segmented Buttons */}
      <div className="inline-flex rounded-full border border-gallery-border p-1 bg-gallery-stone/40 self-start">
        {statusOptions.map((opt) => {
          const isSelected = statusFilter === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onStatusChange(opt.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-gallery-ink text-gallery-milk shadow-sm'
                  : 'text-gallery-muted hover:text-gallery-ink'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Material filter & Count */}
      <div className="flex items-center space-x-4">
        {/* Material select dropdown */}
        <select
          value={materialFilter}
          onChange={(e) => onMaterialChange(e.target.value)}
          className="text-xs bg-gallery-milk border border-gallery-border rounded px-3 py-1.5 text-gallery-ink focus:outline-none focus:ring-1 focus:ring-gallery-ink"
          aria-label={t.filter.filterByMaterial}
        >
          {materialOptions.map((mat) => (
            <option key={mat.id} value={mat.id}>
              {mat.label}
            </option>
          ))}
        </select>

        <span className="text-xs text-gallery-muted tabular-nums">
          {totalCount} {t.filter.countWorks}
        </span>
      </div>
    </div>
  );
};
