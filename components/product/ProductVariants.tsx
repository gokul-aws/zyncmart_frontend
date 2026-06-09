'use client';

interface Variant {
  name: string;
  options: string[];
}

interface ProductVariantsProps {
  variants: Variant[];
  selected: Record<string, string>;
  onChange: (variantName: string, option: string) => void;
}

export default function ProductVariants({ variants, selected, onChange }: ProductVariantsProps) {
  if (!variants.length) return null;

  return (
    <div className="flex flex-col gap-4">
      {variants.map((variant) => (
        <div key={variant.name}>
          <p className="text-sm font-medium text-gray-700 mb-2">
            {variant.name}:{' '}
            <span className="font-semibold text-gray-900">{selected[variant.name]}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {variant.options.map((option) => (
              <button
                key={option}
                onClick={() => onChange(variant.name, option)}
                className={`px-3.5 py-1.5 rounded-md border text-sm font-medium transition-colors ${
                  selected[variant.name] === option
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
