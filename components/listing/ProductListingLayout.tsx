import { Suspense } from 'react';
import FilterSidebar from '@/components/filters/FilterSidebar';
import FilterDrawer from '@/components/filters/FilterDrawer';
import SortDropdown from '@/components/filters/SortDropdown';
import ActiveFilters from '@/components/filters/ActiveFilters';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductGridSkeleton } from '@/components/product/ProductSkeleton';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/ui/Breadcrumbs';
import type { Category } from '@/types/category';

interface ProductListingLayoutProps {
  title: string;
  description?: string;
  breadcrumbs: BreadcrumbItem[];
  categories: Category[];
  /** Category implied by the route (category pages). */
  defaultCategory?: string;
}

/** Shared layout for /products and /categories/[slug]. Server component; client leaves only. */
export default function ProductListingLayout({ title, description, breadcrumbs, categories, defaultCategory }: ProductListingLayoutProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
      <Breadcrumbs items={breadcrumbs} />

      <header className="mt-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">{description}</p>}
      </header>

      <div className="flex items-start gap-10">
        <aside className="hidden w-60 shrink-0 md:block" aria-label="Product filters">
          <div className="sticky top-24">
            <Suspense fallback={null}>
              <FilterSidebar categories={categories} defaultCategory={defaultCategory} />
            </Suspense>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="md:hidden">
              <Suspense fallback={null}>
                <FilterDrawer categories={categories} defaultCategory={defaultCategory} />
              </Suspense>
            </div>
            <div className="hidden min-w-0 flex-1 md:block">
              <Suspense fallback={null}>
                <ActiveFilters categories={categories} />
              </Suspense>
            </div>
            <Suspense fallback={null}>
              <SortDropdown />
            </Suspense>
            <div className="w-full md:hidden">
              <Suspense fallback={null}>
                <ActiveFilters categories={categories} />
              </Suspense>
            </div>
          </div>

          <Suspense fallback={<ProductGridSkeleton count={12} />}>
            <ProductGrid defaultCategory={defaultCategory} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
