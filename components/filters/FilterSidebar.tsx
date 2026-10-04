'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import CategoryFilter from './CategoryFilter';
import PriceRangeSlider from './PriceRangeSlider';
import { Checkbox } from '@/components/ui/Input';
import type { Category } from '@/types/category';

interface Props {
  categories: Category[];
  defaultCategory?: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border py-5 first:pt-0 last:border-0">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </section>
  );
}

export default function FilterSidebar({ categories, defaultCategory }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInStock = searchParams.get('inStock') === 'true';

  const toggleInStock = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isInStock) params.delete('inStock');
    else params.set('inStock', 'true');
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  return (
    <div>
      <Section title="Category">
        <CategoryFilter categories={categories} defaultCategory={defaultCategory} />
      </Section>
      <Section title="Price">
        {/* Remount when the URL range changes (e.g. a chip was removed). */}
        <PriceRangeSlider key={`${searchParams.get('minPrice') ?? ''}-${searchParams.get('maxPrice') ?? ''}`} />
      </Section>
      <Section title="Availability">
        <Checkbox label="In stock only" checked={isInStock} onChange={toggleInStock} />
      </Section>
    </div>
  );
}
