import Link from 'next/link';
import type { Category } from '@/types/category';
import CategoryTile from '@/components/category/CategoryTile';

const MAX = 6;

export default function FeaturedCategories({ categories }: { categories: Category[] }) {
  const visible = categories.filter((c) => c.isActive && !c.parent).slice(0, MAX);
  if (visible.length === 0) return null;

  return (
    <section aria-labelledby="home-categories" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <h2 id="home-categories" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Shop by category
          </h2>
          <Link href="/categories" className="inline-flex h-11 items-center text-sm font-semibold text-primary hover:underline">
            All categories
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-x-3 gap-y-6 sm:gap-x-5 lg:grid-cols-6">
          {visible.map((category) => (
            <CategoryTile key={category._id} category={category} sizes="(max-width: 1024px) 33vw, 16vw" />
          ))}
        </div>
      </div>
    </section>
  );
}
