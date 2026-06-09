import Link from 'next/link';
import type { Product } from '@/types/product';
import ProductCard from '@/components/product/ProductCard';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  // Split into two rows for the horizontal scroll
  const mid = Math.ceil(products.length / 2);
  const topRow = products.slice(0, mid);
  const bottomRow = products.slice(mid);

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Products</h2>
          <Link
            href="/products?isFeatured=true"
            className="text-sm font-medium text-primary hover:opacity-80 transition-opacity"
          >
            View all
          </Link>
        </div>

        {/* 2-row horizontal scroll */}
        <div className="overflow-x-auto -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-hide">
          <div className="flex flex-col gap-4" style={{ minWidth: 'max-content' }}>
            {/* Top row */}
            <div className="flex gap-4">
              {topRow.map((product, i) => (
                <div key={product._id} className="w-[180px] sm:w-[220px] flex-none">
                  <ProductCard product={product} priority={i < 3} />
                </div>
              ))}
            </div>

            {/* Bottom row — only render if we have enough products */}
            {bottomRow.length > 0 && (
              <div className="flex gap-4">
                {bottomRow.map((product) => (
                  <div key={product._id} className="w-[180px] sm:w-[220px] flex-none">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
