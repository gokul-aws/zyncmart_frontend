import type { Metadata } from 'next';
import { Suspense } from 'react';
import SearchBar from '@/components/layout/SearchBar';
import SortDropdown from '@/components/filters/SortDropdown';
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
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{q ? <>Results for &ldquo;{q}&rdquo;</> : 'Search'}</h1>
      <div className="mt-4 mb-8 max-w-xl">
        <SearchBar autoFocus={!q} defaultValue={q} />
      </div>

      {q ? (
        <>
          <div className="mb-5 flex justify-end">
            <Suspense fallback={null}>
              <SortDropdown />
            </Suspense>
          </div>
          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            <ProductGrid defaultSearch={q} />
          </Suspense>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Search for jewellery, toys and home accessories.</p>
      )}
    </div>
  );
}
