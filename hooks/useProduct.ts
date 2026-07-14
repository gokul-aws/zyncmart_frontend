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
 */
export function useSyncedColorVariant(
  product: Product,
  selectedId: string | null,
  onSelect: (id: string | null) => void
) {
  const { data: freshProduct } = useProduct(product.slug, product);
  const active = freshProduct ?? product;

  useEffect(() => {
    if (!active.colorVariants?.length) {
      if (selectedId !== null) onSelect(null);
      return;
    }

    const exists = active.colorVariants.some((v) => v._id === selectedId);
    if (!exists) {
      onSelect(active.colorVariants[0]._id ?? null);
    }
  }, [active, selectedId, onSelect]);

  const selected =
    active.colorVariants?.find((v) => v._id === selectedId) ?? null;

  return { activeProduct: active, selectedColorVariant: selected };
}
