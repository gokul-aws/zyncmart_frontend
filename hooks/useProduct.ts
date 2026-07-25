'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { fetchProduct } from '@/lib/api/products';
import type { Product } from '@/types/product';

export function useProduct(slug: string, initialData?: Product) {
  const query = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
    initialData,
    staleTime: 0,
  });

  return query;
}

/**
 * Syncs a locally-held ColorVariant state with the latest product data
 * returned by useProduct. When the product query refetches (e.g. after an
 * admin price update), the variant objects in the store change identity.
 * This hook keeps the selected variant reference up-to-date and falls back
 * to the first variant when the previously-selected one no longer exists.
 *
 * Supports both legacy colorVariants and new backend variants format.
 */
export function useSyncedColorVariant(
  product: Product,
  selectedId: string | null,
  onSelect: (id: string | null) => void
) {
  const { data: freshProduct } = useProduct(product.slug, product);
  const active = freshProduct ?? product;

  // Map backend variants to a ColorVariant-like shape for the storefront
  const resolvedColorVariants = (() => {
    if (active.colorVariants?.length) return active.colorVariants;
    if (active.variants?.length) {
      return active.variants
        .filter((v) => v.color?.name)
        .map((v) => ({
          _id: v._id,
          color: v.color.name,
          colorCode: v.color.code,
          images: v.image
            ? [{ url: v.image, publicId: '', isPrimary: true }]
            : [],
          stock: v.stock,
          sku: v.sku,
          price: v.price,
          originalPrice: v.originalPrice,
        }));
    }
    return [];
  })();

  useEffect(() => {
    if (!resolvedColorVariants.length) {
      if (selectedId !== null) onSelect(null);
      return;
    }

    const exists = resolvedColorVariants.some((v) => v._id === selectedId);
    if (!exists) {
      onSelect(resolvedColorVariants[0]._id ?? null);
    }
  }, [resolvedColorVariants, selectedId, onSelect]);

  const selected =
    resolvedColorVariants.find((v) => v._id === selectedId) ?? null;

  return { activeProduct: active, selectedColorVariant: selected };
}
