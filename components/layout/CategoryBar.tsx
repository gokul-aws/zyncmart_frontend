'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCategories } from '@/hooks/useCategories';
import { cn } from '@/lib/utils';

export default function CategoryBar() {
  const pathname = usePathname();
  const { data: categories = [] } = useCategories();

  if (categories.length === 0) return null;

  return (
    <div className="bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-hide py-2">
          <Link
            href="/products"
            className={cn(
              'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
              pathname === '/products'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            All Products
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat._id}
              href={`/categories/${cat.slug}`}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                pathname === `/categories/${cat.slug}`
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
