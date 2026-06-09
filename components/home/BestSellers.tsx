import Link from 'next/link';
import type { Product } from '@/types/product';
import ProductCarousel from './ProductCarousel';

interface BestSellersProps {
  products: Product[];
}

export default function BestSellers({ products }: BestSellersProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              Customer Favourites
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Best Sellers</h2>
          </div>
          <Link
            href="/products?sortBy=rating"
            className="text-sm font-medium text-primary hover:opacity-80 transition-opacity shrink-0 ml-4"
          >
            View All &rarr;
          </Link>
        </div>
        <ProductCarousel products={products} />
      </div>
    </section>
  );
}
