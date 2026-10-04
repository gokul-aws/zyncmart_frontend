'use client';

import { cn } from '@/lib/utils';

interface Variant {
  name: string;
  options: string[];
}

interface ProductVariantsProps {
  variants: Variant[];
  selected: Record<string, string>;
  onChange: (variantName: string, option: string) => void;
  /** Options that exist but cannot be bought (e.g. out of stock), per group. */
  unavailable?: Record<string, string[]>;
}

export default function ProductVariants({ variants, selected, onChange, unavailable = {} }: ProductVariantsProps) {
  if (!variants.length) return null;

  return (
    <div className="flex flex-col gap-4">
      {variants.map((variant) => (
        <fieldset key={variant.name}>
          <legend className="mb-2.5 text-sm font-medium text-foreground">
            {variant.name}: <span className="font-semibold">{selected[variant.name] || 'Select'}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => {
              const isUnavailable = unavailable[variant.name]?.includes(option) ?? false;
              const isSelected = selected[variant.name] === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onChange(variant.name, option)}
                  disabled={isUnavailable}
                  aria-pressed={isSelected}
                  aria-label={`${option}${isUnavailable ? ', out of stock' : ''}`}
                  className={cn(
                    'inline-flex h-11 min-w-11 items-center justify-center rounded-lg border bg-surface px-3.5 text-sm font-medium transition-colors',
                    isSelected ? 'border-ink ring-1 ring-ink' : 'border-border-strong hover:border-subtle-foreground',
                    'disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-muted disabled:text-muted-foreground disabled:line-through'
                  )}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
