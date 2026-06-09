'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { fetchProducts } from '@/lib/api/products';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';

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

  if (isLoading) {
    return (
      <div>
        <h1 className="text-xl font-bold text-gray-900 mb-5">My Wishlist</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-900">
        My Wishlist {items.length > 0 && `(${items.length})`}
      </h1>

      {items.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Save items you love by tapping the heart icon."
          action={{ label: 'Explore Products', href: '/products' }}
          icon={<Heart className="w-14 h-14" />}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
