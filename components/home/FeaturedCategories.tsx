import Link from 'next/link';
import type { Category } from '@/types/category';
import CategoryCarousel from './CategoryCarousel';

interface FeaturedCategoriesProps {
  categories: Category[];
}

export default function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Category</h2>
          <Link
            href="/categories"
            className="text-sm font-medium text-primary hover:opacity-80 transition-opacity"
          >
            View all
          </Link>
        </div>
        <CategoryCarousel categories={categories} />
      </div>
    </section>
  );
}
