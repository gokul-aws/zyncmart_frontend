'use client';

import { useState } from 'react';
import type { Product } from '@/types/product';
import ProductReviews from './ProductReviews';

type Tab = 'description' | 'specifications' | 'reviews';

interface ProductTabsProps {
  product: Product;
}

const TABS: { key: Tab; label: (p: Product) => string }[] = [
  { key: 'description', label: () => 'Description' },
  { key: 'specifications', label: () => 'Specifications' },
  { key: 'reviews', label: (p) => `Reviews (${p.ratings.count})` },
];

export default function ProductTabs({ product }: ProductTabsProps) {
  const [active, setActive] = useState<Tab>('description');

  const specs: { label: string; value: string }[] = [
    { label: 'SKU', value: product.sku },
    { label: 'Category', value: product.category.name },
    ...(product.brand ? [{ label: 'Brand', value: product.brand }] : []),
    { label: 'Availability', value: product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock' },
    ...(product.variants?.length ? [{ label: 'Variants', value: `${product.variants.length} options available` }] : []),
    ...(product.tags.length ? [{ label: 'Tags', value: product.tags.join(', ') }] : []),
  ];

  return (
    <div id="reviews">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActive(key)}
            className={`shrink-0 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              active === key
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {label(product)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="py-6">
        {active === 'description' && (
          <div className="text-gray-700 text-base leading-7 max-w-3xl whitespace-pre-wrap">
            {product.description}
          </div>
        )}

        {active === 'specifications' && (
          <div className="max-w-lg">
            <dl className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden">
              {specs.map(({ label, value }) => (
                <div key={label} className="flex px-4 py-3 text-sm bg-white even:bg-gray-50">
                  <dt className="w-36 shrink-0 text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}

        {active === 'reviews' && <ProductReviews ratings={product.ratings} productSlug={product.slug} />}
      </div>
    </div>
  );
}
