'use client';
import { useId } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ProductFilters } from '@/types/product';
import { Select } from '@/components/ui/Input';

const OPTIONS: { label: string; value: NonNullable<ProductFilters['sortBy']> }[] = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Price: low to high', value: 'price_asc' },
  { label: 'Price: high to low', value: 'price_desc' },
  { label: 'Top rated', value: 'rating' },
];

export default function SortDropdown() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('sortBy') ?? 'newest';
  const id = useId();

  const handleChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', value);
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="hidden whitespace-nowrap text-sm text-muted-foreground sm:block">
        Sort by
      </label>
      <Select id={id} value={current} onChange={(e) => handleChange(e.target.value)} aria-label="Sort products" className="w-44">
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
