'use client';

import type { ColorVariant } from '@/types/product';

interface ProductColorSelectorProps {
  colorVariants: ColorVariant[];
  selected: ColorVariant | null;
  onChange: (variant: ColorVariant) => void;
}

export default function ProductColorSelector({
  colorVariants,
  selected,
  onChange,
}: ProductColorSelectorProps) {
  if (!colorVariants?.length) return null;

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">
        Color: <span className="font-semibold text-gray-900">{selected?.color}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {colorVariants.map((variant) => {
          const isSelected = selected?._id === variant._id;
          const isOutOfStock = variant.stock === 0;

          return (
            <button
              key={variant._id}
              type="button"
              onClick={() => onChange(variant)}
              aria-label={variant.color}
              aria-pressed={isSelected}
              className={`flex items-center gap-2 rounded-md border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
              } ${isOutOfStock && !isSelected ? 'text-gray-400' : ''}`}
            >
              {variant.colorCode && (
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: variant.colorCode }}
                />
              )}
              {variant.color}
              {isOutOfStock && <span className="text-xs">(Out of stock)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
