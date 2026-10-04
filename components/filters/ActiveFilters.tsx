'use client';
import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/formatters';
import type { Category } from '@/types/category';

/** Removable chips for the filters currently applied (from the URL). */
export default function ActiveFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const chips: { key: string; label: string; remove: string[] }[] = [];
  const category = searchParams.get('category');
  if (category) chips.push({ key: 'category', label: categories.find((c) => c.slug === category)?.name ?? category, remove: ['category'] });
  const min = searchParams.get('minPrice');
  const max = searchParams.get('maxPrice');
  if (min || max) {
    const label = min && max ? `${formatPrice(Number(min))} – ${formatPrice(Number(max))}` : min ? `From ${formatPrice(Number(min))}` : `Up to ${formatPrice(Number(max))}`;
    chips.push({ key: 'price', label, remove: ['minPrice', 'maxPrice'] });
  }
  if (searchParams.get('inStock') === 'true') chips.push({ key: 'stock', label: 'In stock', remove: ['inStock'] });

  if (chips.length === 0) return null;

  const update = (keys: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    keys.forEach((k) => params.delete(k));
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Applied filters" role="group">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={() => update(chip.remove)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border-strong bg-surface pl-3 pr-2 text-sm text-foreground hover:bg-surface-muted"
          aria-label={`Remove filter: ${chip.label}`}
        >
          {chip.label}
          <X className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
        </button>
      ))}
      {chips.length > 1 && (
        <button type="button" onClick={() => update(['category', 'minPrice', 'maxPrice', 'inStock'])} className="h-9 px-2 text-sm font-medium text-primary hover:underline">
          Clear all
        </button>
      )}
    </div>
  );
}
