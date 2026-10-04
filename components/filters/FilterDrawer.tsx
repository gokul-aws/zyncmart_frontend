'use client';
import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import FilterSidebar from './FilterSidebar';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';
import { useProducts } from '@/hooks/useProducts';
import { activeFilterCount, parseProductFilters } from '@/lib/productFilters';
import type { Category } from '@/types/category';

interface Props {
  categories: Category[];
  defaultCategory?: string;
}

/** Mobile filters in a bottom sheet. The result count comes from the grid's own (cached) query. */
export default function FilterDrawer({ categories, defaultCategory }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const count = activeFilterCount(searchParams);
  const { data, isFetching } = useProducts(parseProductFilters(searchParams, { category: defaultCategory }));
  const total = data?.pagination?.total;

  const clearAll = () => {
    const params = new URLSearchParams();
    const sortBy = searchParams.get('sortBy');
    if (sortBy) params.set('sortBy', sortBy);
    router.push(`?${params.toString()}`);
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        Filters
        {count > 0 && (
          <span className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-white">
            {count}
            <span className="sr-only"> applied</span>
          </span>
        )}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        side="bottom"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearAll} disabled={count === 0} className="flex-1">
              Clear all
            </Button>
            <Button onClick={() => setOpen(false)} className="flex-[2]" loading={isFetching}>
              {total === undefined ? 'Show results' : `Show ${total} result${total === 1 ? '' : 's'}`}
            </Button>
          </div>
        }
      >
        <FilterSidebar categories={categories} defaultCategory={defaultCategory} />
      </Dialog>
    </>
  );
}
