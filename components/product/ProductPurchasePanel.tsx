'use client';

import { useVariantSelection } from '@/hooks/useProduct';
import type { Product } from '@/types/product';
import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';

interface ProductPurchasePanelProps {
  product: Product;
}

// Owns the resolved variant (color + size) so the gallery and info panel —
// rendered side by side as separate components — react to a selection
// change together without a page reload. Falls back to the product's own
// images/price/stock when there are no variants (simple products).
export default function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const selection = useVariantSelection(product);
  const { activeProduct, selectedVariant } = selection;

  const activeImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : activeProduct.images;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
      <div className="md:sticky md:top-24 self-start">
        <ProductImageGallery
          key={selectedVariant?._id ?? 'default'}
          images={activeImages}
          productName={activeProduct.name}
        />
      </div>

      <ProductInfo product={activeProduct} selection={selection} />
    </div>
  );
}
