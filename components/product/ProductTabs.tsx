'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/types/product';
import Tabs from '@/components/ui/Tabs';
import ProductReviews from './ProductReviews';
import { SHOW_REVIEWS_EVENT } from './ProductInfo';

interface ProductTabsProps {
  product: Product;
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [active, setActive] = useState('description');

  // "N reviews" link in the purchase panel opens this tab.
  useEffect(() => {
    const open = () => setActive('reviews');
    window.addEventListener(SHOW_REVIEWS_EVENT, open);
    return () => window.removeEventListener(SHOW_REVIEWS_EVENT, open);
  }, []);

  const specs: { label: string; value: string }[] = [
    ...(product.sku ? [{ label: 'SKU', value: product.sku }] : []),
    { label: 'Category', value: product.category.name },
    ...(product.brand ? [{ label: 'Brand', value: product.brand }] : []),
    { label: 'Availability', value: product.stock > 0 ? `In stock (${product.stock} units)` : 'Out of stock' },
    ...(product.variants?.length ? [{ label: 'Options', value: `${product.variants.length} colour/size options` }] : []),
    ...(product.tags.length ? [{ label: 'Tags', value: product.tags.join(', ') }] : []),
  ];

  return (
    <section id="product-details" aria-label="Product details" className="scroll-mt-24">
      <Tabs
        label="Product details"
        active={active}
        onChange={setActive}
        items={[
          {
            key: 'description',
            label: 'Description',
            content: <div className="max-w-3xl whitespace-pre-wrap text-base leading-7 text-foreground/90">{product.description}</div>,
          },
          {
            key: 'specifications',
            label: 'Specifications',
            content: (
              <dl className="max-w-lg divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex gap-4 px-4 py-3 text-sm">
                    <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
                    <dd className="min-w-0 font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            ),
          },
          {
            key: 'reviews',
            label: `Reviews (${product.ratings.count})`,
            content: <ProductReviews ratings={product.ratings} productSlug={product.slug} />,
          },
        ]}
      />
    </section>
  );
}
