'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchProduct } from '@/lib/api/products';
import type { Product, ProductImage } from '@/types/product';

export function useProduct(slug: string, initialData?: Product) {
  const query = useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug),
    initialData,
    staleTime: 0,
  });

  return query;
}

export interface ResolvedVariant {
  _id: string;
  color?: { name: string; code?: string };
  size?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  sku: string;
  images: ProductImage[];
}

export interface ColorOption {
  name: string;
  code?: string;
  stock: number;
}

/**
 * Resolves the exact backend variant for a product from independent color
 * and size selections (a variant is uniquely identified by the combination,
 * not by color alone — a product can have several sizes per color).
 *
 * Also re-syncs against the latest product data returned by useProduct, so
 * the selection stays valid if the product is refetched (e.g. after an
 * admin edit). Supports both legacy colorVariants and the current backend
 * `variants` shape.
 */
export function useVariantSelection(product: Product) {
  const { data: freshProduct } = useProduct(product.slug, product);
  const active = freshProduct ?? product;

  const variants: ResolvedVariant[] = useMemo(() => {
    if (active.productType === 'variable' && active.variants?.length) {
      return active.variants
        .filter((v) => v._id)
        .map((v) => ({
          _id: v._id as string,
          color: v.color?.name ? { name: v.color.name, code: v.color.code } : undefined,
          size: v.size || undefined,
          price: v.price,
          originalPrice: v.originalPrice,
          stock: v.stock,
          sku: v.sku,
          images: v.images?.length ? v.images : (v.image ? [{ url: v.image, publicId: '', isPrimary: true }] : []),
        }));
    }
    if (active.colorVariants?.length) {
      return active.colorVariants
        .filter((cv) => cv._id)
        .map((cv) => ({
          _id: cv._id as string,
          color: { name: cv.color, code: cv.colorCode },
          size: undefined,
          price: cv.price ?? active.price,
          originalPrice: cv.originalPrice,
          stock: cv.stock,
          sku: cv.sku,
          images: cv.images ?? [],
        }));
    }
    return [];
  }, [active]);

  const hasVariants = variants.length > 0;

  const colors: ColorOption[] = useMemo(() => {
    const byName = new Map<string, ColorOption>();
    for (const v of variants) {
      if (!v.color?.name) continue;
      const existing = byName.get(v.color.name);
      if (existing) {
        existing.stock += v.stock;
      } else {
        byName.set(v.color.name, { name: v.color.name, code: v.color.code, stock: v.stock });
      }
    }
    return Array.from(byName.values());
  }, [variants]);

  const hasColorAxis = colors.length > 0;

  // Raw user picks. Rather than syncing these back to "valid" values via an
  // effect (which lags a render behind and re-triggers renders), the
  // "effective" selection below derives the valid value directly — falling
  // back to the first option whenever the raw pick doesn't apply to the
  // current product/color.
  const [rawSelectedColor, setSelectedColor] = useState<string | null>(null);
  const [rawSelectedSize, setSelectedSize] = useState<string | null>(null);

  const selectedColor = hasColorAxis
    ? (colors.some((c) => c.name === rawSelectedColor) ? rawSelectedColor : colors[0].name)
    : null;

  const sizesForSelectedColor: string[] = useMemo(() => {
    const pool = hasColorAxis
      ? variants.filter((v) => v.color?.name === selectedColor)
      : variants;
    return Array.from(new Set(pool.filter((v) => v.size).map((v) => v.size as string)));
  }, [variants, selectedColor, hasColorAxis]);

  const hasSizeAxis = sizesForSelectedColor.length > 1;

  // Auto-picks the only size when there's just one, so resolution works
  // even with the size selector hidden.
  const selectedSize = sizesForSelectedColor.length
    ? (sizesForSelectedColor.includes(rawSelectedSize ?? '') ? rawSelectedSize : sizesForSelectedColor[0])
    : null;

  const selectedVariant: ResolvedVariant | null = useMemo(() => {
    if (!hasVariants) return null;
    return (
      variants.find(
        (v) =>
          (hasColorAxis ? v.color?.name === selectedColor : true) &&
          (v.size ? v.size === selectedSize : true)
      ) ?? null
    );
  }, [variants, hasColorAxis, selectedColor, selectedSize, hasVariants]);

  return {
    activeProduct: active,
    hasVariants,
    colors,
    hasColorAxis,
    selectedColor,
    setSelectedColor,
    sizesForSelectedColor,
    hasSizeAxis,
    selectedSize,
    setSelectedSize,
    selectedVariant,
  };
}
