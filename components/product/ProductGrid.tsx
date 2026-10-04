'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { PackageSearch } from 'lucide-react';
import ProductCard from './ProductCard';
import { ProductGridSkeleton, PRODUCT_GRID_CLASSES } from './ProductSkeleton';
import { useProducts } from '@/hooks/useProducts';
import { parseProductFilters } from '@/lib/productFilters';
import Pagination from '@/components/ui/Pagination';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  defaultCategory?: string;
  defaultSearch?: string;
}

export default function ProductGrid({ defaultCategory, defaultSearch }: ProductGridProps = {}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filters = parseProductFilters(searchParams, { category: defaultCategory, search: defaultSearch });

  const { data, isLoading, isError, isFetching, refetch } = useProducts(filters);

  if (isLoading) return <ProductGridSkeleton count={12} />;

  if (isError) {
    return (
      <Alert
        variant="error"
        title="Products could not be loaded"
        action={
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        }
      >
        Please check your connection and try again.
      </Alert>
    );
  }

  const products = data?.data ?? [];
  const pagination = data?.pagination;

  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch />}
        title="No products found"
        description="Try removing a filter or searching for something else."
        action={{ label: 'View all products', href: '/products' }}
      />
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
        <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
          {pagination.total} product{pagination.total !== 1 ? 's' : ''}
        </p>
      )}

      <div className={cn(PRODUCT_GRID_CLASSES, 'transition-opacity duration-200', isFetching ? 'opacity-60' : 'opacity-100')} aria-busy={isFetching}>
        {products.map((product, i) => (
          <ProductCard key={product._id} product={product} priority={i < 4} />
        ))}
      </div>

      {pagination && <Pagination page={pagination.page} pages={pagination.pages} onPageChange={goToPage} className="mt-12" />}
    </div>
  );
}
