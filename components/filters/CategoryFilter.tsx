'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Category } from '@/types/category';

interface Props {
  categories: Category[];
  /** Category implied by the route (category pages). */
  defaultCategory?: string;
}

/** Single-choice list (radio semantics), including "All categories". */
export default function CategoryFilter({ categories, defaultCategory }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('category') || defaultCategory || '';

  const select = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set('category', slug);
    else params.delete('category');
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const topLevel = categories.filter((c) => c.isActive && !c.parent);

  if (topLevel.length === 0) {
    return <p className="text-sm text-muted-foreground">No categories available</p>;
  }

  const options = [{ slug: '', name: 'All categories' }, ...topLevel.map((c) => ({ slug: c.slug, name: c.name }))];

  return (
    <fieldset>
      <legend className="sr-only">Category</legend>
      <ul className="space-y-0.5">
        {options.map((opt) => (
          <li key={opt.slug || 'all'}>
            <label className="flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-1 text-sm text-foreground hover:bg-surface-muted">
              <input
                type="radio"
                name="category-filter"
                checked={current === opt.slug}
                onChange={() => select(opt.slug)}
                className="h-4 w-4 accent-primary"
              />
              {opt.name}
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}
