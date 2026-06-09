'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { PackageSearch, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { ProductSkeleton } from './ProductSkeleton';
import { useProducts } from '@/hooks/useProducts';
import type { ProductFilters } from '@/types/product';

function parseFilters(params: URLSearchParams): ProductFilters {
  const f: ProductFilters = { limit: 12 };

  const category = params.get('category');
  if (category) f.category = category;

  const minPrice = params.get('minPrice');
  if (minPrice) f.minPrice = Number(minPrice);

  const maxPrice = params.get('maxPrice');
  if (maxPrice) f.maxPrice = Number(maxPrice);

  const inStock = params.get('inStock');
  if (inStock === 'true') f.inStock = true;

  const tags = params.get('tags');
  if (tags) f.tags = tags.split(',');

  const sortBy = params.get('sortBy') as ProductFilters['sortBy'];
  if (sortBy) f.sortBy = sortBy;

  const search = params.get('q');
  if (search) f.search = search;

  f.page = Number(params.get('page') ?? 1);

  return f;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const delta = 2;
  const inner: number[] = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    inner.push(i);
  }

  const result: (number | '...')[] = [1];
  if (inner[0] > 2) result.push('...');
  result.push(...inner);
  if (inner[inner.length - 1] < total - 1) result.push('...');
  result.push(total);
  return result;
}

interface ProductGridProps {
  defaultCategory?: string;
  defaultSearch?: string;
}

export default function ProductGrid({ defaultCategory, defaultSearch }: ProductGridProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filters = parseFilters(searchParams);
  if (defaultCategory && !filters.category) filters.category = defaultCategory;
  if (defaultSearch && !filters.search) filters.search = defaultSearch;

  const { data, isLoading, isError, isFetching } = useProducts(filters);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageSearch className="w-16 h-16 text-gray-300 mb-4" />
        <p className="text-gray-500 text-sm">
          Failed to load products. Please try again.
        </p>
      </div>
    );
  }

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageSearch className="w-16 h-16 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-700 mb-1">
          No products found
        </h3>
        <p className="text-gray-500 text-sm">
          Try adjusting or clearing your filters.
        </p>
      </div>
    );
  }

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {pagination && (
        <p className="text-sm text-gray-500 mb-4">
          {pagination.total} product{pagination.total !== 1 ? 's' : ''} found
        </p>
      )}

      <div
        className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 transition-opacity duration-200 ${
          isFetching ? 'opacity-60' : 'opacity-100'
        }`}
      >
        {products.map((product, i) => (
          <ProductCard key={product._id} product={product} priority={i < 4} />
        ))}
      </div>

      {pagination && pagination.pages > 1 && (
        <nav
          className="flex items-center justify-center gap-1.5 mt-8"
          aria-label="Pagination"
        >
          <button
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {getPageNumbers(pagination.page, pagination.pages).map(
            (item, idx) =>
              item === '...' ? (
                <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-sm">
                  …
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => goToPage(item as number)}
                  aria-current={item === pagination.page ? 'page' : undefined}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    item === pagination.page
                      ? 'bg-primary text-white'
                      : 'border border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {item}
                </button>
              )
          )}

          <button
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
