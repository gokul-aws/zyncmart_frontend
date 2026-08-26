'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import ProductCard from '@/components/product/ProductCard';
import EmptyState from '@/components/ui/EmptyState';

export default function WishlistClient() {
  // The wishlist store is the source of truth (backed by GET /wishlist,
  // fully populated) — no separate product fetch needed, and unlike the
  // previous implementation this can't silently drop items that aren't
  // among the 50 most-recently-created products in the whole catalog.
  const { products: entries, loadWishlist } = useWishlist();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWishlist().finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const products = entries.map((e) => e.product);

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
        My Wishlist {products.length > 0 && `(${products.length})`}
      </h1>

      {products.length === 0 ? (
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
