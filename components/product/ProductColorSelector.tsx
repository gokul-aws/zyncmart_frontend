'use client';

import type { ColorOption } from '@/hooks/useProduct';

interface ProductColorSelectorProps {
  colors: ColorOption[];
  selected: string | null;
  onChange: (colorName: string) => void;
}

export default function ProductColorSelector({
  colors,
  selected,
  onChange,
}: ProductColorSelectorProps) {
  if (!colors?.length) return null;

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-2">
        Color: <span className="font-semibold text-gray-900">{selected}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = selected === color.name;
          const isOutOfStock = color.stock === 0;

          return (
            <button
              key={color.name}
              type="button"
              onClick={() => onChange(color.name)}
              aria-label={color.name}
              aria-pressed={isSelected}
              className={`flex items-center gap-2 rounded-md border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isSelected
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
              } ${isOutOfStock && !isSelected ? 'text-gray-400' : ''}`}
            >
              {color.code && (
                <span
                  className="h-3.5 w-3.5 rounded-full border border-black/10 shrink-0"
                  style={{ backgroundColor: color.code }}
                />
              )}
              {color.name}
              {isOutOfStock && <span className="text-xs">(Out of stock)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
