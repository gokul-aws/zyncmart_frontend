'use client';

import { cn } from '@/lib/utils';
import type { ColorVariant } from '@/types/product';

interface ProductColorSelectorProps {
  colorVariants: ColorVariant[];
  selected: ColorVariant | null;
  onChange: (variant: ColorVariant) => void;
}

export default function ProductColorSelector({ colorVariants, selected, onChange }: ProductColorSelectorProps) {
  if (!colorVariants?.length) return null;

  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-medium text-foreground">
        Colour: <span className="font-semibold">{selected?.color ?? 'Select'}</span>
      </legend>
      <div className="flex flex-wrap gap-2">
        {colorVariants.map((variant) => {
          const isSelected = selected?._id === variant._id || (!!selected && selected.color === variant.color);
          const isOutOfStock = variant.stock === 0;

          return (
            <button
              key={variant._id ?? variant.color}
              type="button"
              onClick={() => onChange(variant)}
              aria-pressed={isSelected}
              aria-label={`${variant.color}${isOutOfStock ? ', out of stock' : ''}`}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-lg border bg-surface px-3.5 text-sm font-medium transition-colors',
                isSelected ? 'border-ink ring-1 ring-ink' : 'border-border-strong hover:border-subtle-foreground',
                isOutOfStock && 'text-muted-foreground'
              )}
            >
              {variant.colorCode && (
                <span className="h-5 w-5 shrink-0 rounded-full border border-black/15" style={{ backgroundColor: variant.colorCode }} aria-hidden="true" />
              )}
              <span className={cn(isOutOfStock && 'line-through')}>{variant.color}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
