import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { fetchCategories } from '@/lib/api/categories';
import type { Category } from '@/types/category';

export const revalidate = 3600;

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Store';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

const FALLBACK_GRADIENTS = [
  'from-amber-400 to-orange-500',
  'from-pink-400 to-rose-500',
  'from-blue-400 to-indigo-500',
  'from-green-400 to-emerald-500',
  'from-purple-400 to-violet-500',
  'from-yellow-400 to-amber-500',
];

export const metadata: Metadata = {
  title: 'Shop by Category',
  description: `Browse all product categories at ${SITE_NAME}. Shop jewellery, toys, home accessories and more.`,
  alternates: { canonical: `${SITE_URL}/categories` },
  openGraph: {
    title: `Shop by Category | ${SITE_NAME}`,
    description: `Browse all product categories at ${SITE_NAME}. Shop jewellery, toys, home accessories and more.`,
    url: `${SITE_URL}/categories`,
  },
  robots: { index: true, follow: true },
};

export default async function CategoriesPage() {
  let categories: Category[] = [];

  try {
    const res = await fetchCategories();
    categories = res.data ?? [];
  } catch {
    // API unreachable — renders empty state
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center gap-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-gray-800 transition-colors">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-gray-300">/</li>
          <li className="text-gray-900 font-medium">Categories</li>
        </ol>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">Shop by Category</h1>
      <p className="text-sm text-gray-500 mb-8">
        Explore our full range of product categories.
      </p>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-gray-400 text-lg font-medium">No categories found</p>
          <p className="text-gray-400 text-sm mt-1">Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.map((category, i) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              className="group flex flex-col"
            >
              <div
                className="relative aspect-square rounded-2xl overflow-hidden shadow-sm
                           ring-2 ring-transparent group-hover:ring-primary/40
                           transition-all duration-300"
              >
                {category.image?.url ? (
                  <Image
                    src={category.image.url}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]}`}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-semibold leading-tight drop-shadow-sm">
                    {category.name}
                  </p>
                </div>
              </div>
              {category.description && (
                <p className="mt-2 text-xs text-gray-500 line-clamp-2 px-1">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
