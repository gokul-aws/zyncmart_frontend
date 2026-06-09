'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import CategoryFilter from './CategoryFilter';
import PriceRangeSlider from './PriceRangeSlider';
import type { Category } from '@/types/category';

interface Props {
  categories: Category[];
  defaultCategory?: string;
}

export default function FilterSidebar({ categories, defaultCategory }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasFilters =
    searchParams.get('category') ||
    searchParams.get('minPrice') ||
    searchParams.get('maxPrice') ||
    searchParams.get('inStock');

  const isInStock = searchParams.get('inStock') === 'true';

  const clearAll = () => {
    const params = new URLSearchParams();
    const sortBy = searchParams.get('sortBy');
    if (sortBy) params.set('sortBy', sortBy);
    router.push(`?${params.toString()}`);
  };

  const toggleInStock = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (isInStock) params.delete('inStock');
    else params.set('inStock', 'true');
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 text-base">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <section>
        <h3 className="text-sm font-semibold text-gray-800 mb-3">Category</h3>
        <CategoryFilter categories={categories} />
      </section>

      <div className="border-t border-gray-100" />

      {/* Price range */}
      <section>
        <h3 className="text-sm font-semibold text-gray-800 mb-4">Price Range</h3>
        <PriceRangeSlider />
      </section>

      <div className="border-t border-gray-100" />

      {/* In-stock toggle */}
      <section>
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm font-semibold text-gray-800">In Stock Only</span>
          <button
            role="switch"
            aria-checked={isInStock}
            onClick={toggleInStock}
            className={`relative inline-flex w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${
              isInStock ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                isInStock ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </label>
      </section>
    </div>
  );
}
