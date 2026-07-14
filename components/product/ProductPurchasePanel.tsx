'use client';

import { useState } from 'react';
import { useSyncedColorVariant } from '@/hooks/useProduct';
import type { Product } from '@/types/product';
import ProductImageGallery from './ProductImageGallery';
import ProductInfo from './ProductInfo';

interface ProductPurchasePanelProps {
  product: Product;
}

// Owns the selected color variant so the gallery and info panel — rendered
// side by side as separate components — can react to a color change together
// without a page reload. Falls back to the product's own images/price/stock
// when there are no color variants (legacy products).
export default function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const [selectedColorVariantId, setSelectedColorVariantId] = useState<string | null>(
    product.colorVariants?.[0]?._id ?? null
  );

  const { activeProduct, selectedColorVariant } = useSyncedColorVariant(
    product,
    selectedColorVariantId,
    setSelectedColorVariantId
  );

  const activeImages = selectedColorVariant?.images?.length
    ? selectedColorVariant.images
    : activeProduct.images;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-12">
      <div className="md:sticky md:top-24 self-start">
        <ProductImageGallery
          key={selectedColorVariant?._id ?? 'default'}
          images={activeImages}
          productName={activeProduct.name}
        />
      </div>

      <ProductInfo
        product={activeProduct}
        selectedColorVariant={selectedColorVariant}
        onColorChange={(variant) => setSelectedColorVariantId(variant._id ?? null)}
      />
    </div>
  );
}
