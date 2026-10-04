import Skeleton from '@/components/ui/Skeleton';

export function ProductSkeleton() {
  return (
    <div className="flex flex-col">
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <div className="space-y-2 pt-3">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <Skeleton className="mt-3 h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export const PRODUCT_GRID_CLASSES = 'grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4';

export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className={PRODUCT_GRID_CLASSES} role="status" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}
