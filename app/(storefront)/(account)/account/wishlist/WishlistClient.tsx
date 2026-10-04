'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { fetchProducts } from '@/lib/api/products';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';
import { ProductGridSkeleton } from '@/components/product/ProductSkeleton';

export default function WishlistClient() {
  const { items } = useWishlist();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist-products', items],
    queryFn: () =>
      items.length === 0
        ? Promise.resolve({ data: [], pagination: { page: 1, limit: 0, total: 0, pages: 0 }, success: true })
        : fetchProducts({ limit: 50 }),
    enabled: items.length > 0,
    staleTime: 60_000,
  });

  const products = (data?.data ?? []).filter((p) => items.includes(p._id));

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        My wishlist {items.length > 0 && <span className="text-lg font-medium text-muted-foreground">({items.length})</span>}
      </h1>

      {items.length === 0 ? (
        <EmptyState compact title="Your wishlist is empty" description="Tap the heart on any product to save it here." action={{ label: 'Explore products', href: '/products' }} icon={<Heart />} />
      ) : isLoading ? (
        <ProductGridSkeleton count={3} />
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 sm:gap-x-5">
          {products.map((product) => (
            <li key={product._id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
