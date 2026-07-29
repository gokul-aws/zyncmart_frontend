import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchBar from '@/components/layout/SearchBar';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductSkeleton';

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Store';

type SearchParams = Promise<{ q?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { q } = await searchParams;
  const title = q ? `Results for "${q}"` : 'Search';
  return {
    title,
    description: q ? `Search results for "${q}" at ${SITE_NAME}.` : `Search products at ${SITE_NAME}.`,
    robots: { index: false, follow: false },
  };
}

export default async function SearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { q } = await searchParams;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Search input */}
      <div className="mb-6 max-w-xl">
        <SearchBar autoFocus defaultValue={q} />
      </div>

      {q ? (
        <>
          <h1 className="text-xl font-bold text-gray-900 mb-5">
            Results for &ldquo;{q}&rdquo;
          </h1>
          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            <ProductGrid defaultSearch={q} />
          </Suspense>
        </>
      ) : (
        <p className="text-gray-500 text-sm">Enter a search term above to find products.</p>
      )}
    </div>
  );
}
