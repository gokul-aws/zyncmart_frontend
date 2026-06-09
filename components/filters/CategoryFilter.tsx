'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Category } from '@/types/category';

interface Props {
  categories: Category[];
}

export default function CategoryFilter({ categories }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('category') ?? '';

  const toggle = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === current) {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const topLevel = categories.filter((c) => c.isActive && !c.parent);

  if (topLevel.length === 0) {
    return <p className="text-sm text-gray-400 italic">No categories available</p>;
  }

  return (
    <ul className="space-y-1.5">
      {topLevel.map((cat) => (
        <li key={cat._id}>
          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={current === cat.slug}
              onChange={() => toggle(cat.slug)}
              className="w-4 h-4 rounded border-gray-300 accent-[var(--color-primary)] cursor-pointer"
            />
            <span className="text-sm text-gray-700 group-hover:text-gray-900 select-none">
              {cat.name}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
