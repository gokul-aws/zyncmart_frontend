import Link from 'next/link';
import type { Product } from '@/types/product';
import ProductCarousel from './ProductCarousel';

interface NewArrivalsProps {
  products: Product[];
}

export default function NewArrivals({ products }: NewArrivalsProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 bg-primary-light/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
              Just Landed
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">New Arrivals</h2>
          </div>
          <Link
            href="/products?sortBy=newest"
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
