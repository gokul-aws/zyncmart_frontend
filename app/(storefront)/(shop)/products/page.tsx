import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { fetchCategories, fetchCategory } from '@/lib/api/categories';
import FilterSidebar from '@/components/filters/FilterSidebar';
import FilterDrawer from '@/components/filters/FilterDrawer';
import SortDropdown from '@/components/filters/SortDropdown';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductSkeleton';
import type { Category } from '@/types/category';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Store';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? '';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const categorySlug =
    typeof params.category === 'string' ? params.category : undefined;

  let categoryName = 'All Products';
  if (categorySlug) {
    try {
      const res = await fetchCategory(categorySlug);
      if (res.data) categoryName = res.data.name;
    } catch {
      // use default
    }
  }

  const canonicalUrl = categorySlug
    ? `${SITE_URL}/products?category=${categorySlug}`
    : `${SITE_URL}/products`;
  const description = `Shop ${categoryName.toLowerCase()} at ${SITE_NAME}. Filter by price, brand, and more.`;
  const pageTitle = categorySlug ? `Buy ${categoryName} Online` : 'Shop Online';

  return {
    title: pageTitle,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${pageTitle} | ${SITE_NAME}`,
      description,
      url: canonicalUrl,
    },
    robots: { index: true, follow: true },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const categorySlug =
    typeof params.category === 'string' ? params.category : undefined;

  let categories: Category[] = [];
  try {
    const res = await fetchCategories();
    categories = res.data ?? [];
  } catch {
    // sidebar renders without categories
  }

  const categoryName =
    categories.find((c) => c.slug === categorySlug)?.name ?? 'All Products';

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
          {categorySlug ? (
            <>
              <li>
                <Link
                  href="/products"
                  className="hover:text-gray-800 transition-colors"
                >
                  Products
                </Link>
              </li>
              <li aria-hidden="true" className="text-gray-300">/</li>
              <li className="text-gray-900 font-medium">{categoryName}</li>
            </>
          ) : (
            <li className="text-gray-900 font-medium">Products</li>
          )}
        </ol>
      </nav>

      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{categoryName}</h1>

      <div className="flex gap-8 items-start">
        {/* Desktop sidebar (sticky) */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24">
            <Suspense fallback={null}>
              <FilterSidebar categories={categories} />
            </Suspense>
          </div>
        </aside>

        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Controls bar */}
          <div className="flex items-center justify-between mb-5">
            {/* Mobile filter trigger */}
            <div className="md:hidden">
              <Suspense fallback={null}>
                <FilterDrawer categories={categories} />
              </Suspense>
            </div>

            {/* Sort dropdown (right-aligned on desktop) */}
            <div className="md:ml-auto">
              <Suspense fallback={null}>
                <SortDropdown />
              </Suspense>
            </div>
          </div>

          {/* Product grid */}
          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            <ProductGrid />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
