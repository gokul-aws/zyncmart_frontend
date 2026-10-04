// Display-only summaries of a product for listings and search. Nothing here
// is authoritative: the server prices the cart, checkout and orders, and
// re-checks stock. These values only decide what a card shows.
import type { Product } from '@/types/product';

export interface ProductSwatch {
  name: string;
  code?: string;
  /** Image to preview for this colour, when the variant has one. */
  image?: string;
}

export interface ProductSummary {
  /** Lowest price a customer can currently buy at (cheapest in-stock option). */
  price: number;
  /** MRP of that same option, only when higher than `price`. */
  comparePrice?: number;
  /** Options are sold at different prices ("From ₹…"). */
  hasPriceRange: boolean;
  inStock: boolean;
  /** "Only 3 left" for single-stock items; "Few left" across variants; null otherwise. */
  lowStockLabel: string | null;
  /** The customer has to pick colour/size on the product page. */
  needsOptions: boolean;
  /** Variant used by quick-add when there is exactly one option. */
  defaultVariantId: string | null;
  swatches: ProductSwatch[];
  image?: string;
}

export function primaryImageUrl(product: Product): string | undefined {
  return product.images?.find((i) => i.isPrimary)?.url ?? product.images?.[0]?.url;
}

export function summarizeProduct(product: Product): ProductSummary {
  const variants = product.variants ?? [];
  const legacy = product.colorVariants ?? [];
  const isVariable = product.productType === 'variable' && variants.length > 0;
  const threshold = product.lowStockThreshold ?? 5;

  if (isVariable) {
    const buyable = variants.filter((v) => v.stock > 0);
    const pool = buyable.length ? buyable : variants;
    // The comparison price belongs to the same option as the shown price, so
    // the discount is never overstated by mixing two different variants.
    const cheapest = pool.reduce((min, v) => (v.price < min.price ? v : min), pool[0]);
    const totalStock = buyable.reduce((sum, v) => sum + v.stock, 0);

    const swatches: ProductSwatch[] = [];
    for (const v of variants) {
      if (v.color?.name && !swatches.some((s) => s.name === v.color.name)) {
        swatches.push({ name: v.color.name, code: v.color.code, image: v.image });
      }
    }

    return {
      price: cheapest.price,
      comparePrice: cheapest.originalPrice && cheapest.originalPrice > cheapest.price ? cheapest.originalPrice : undefined,
      hasPriceRange: new Set(variants.map((v) => v.price)).size > 1,
      inStock: buyable.length > 0,
      lowStockLabel: buyable.length > 0 && totalStock <= threshold ? (buyable.length === 1 ? `Only ${totalStock} left` : 'Few left') : null,
      needsOptions: variants.length > 1,
      defaultVariantId: (buyable[0] ?? variants[0])._id ?? null,
      swatches,
      image: primaryImageUrl(product) ?? variants.find((v) => v.image)?.image,
    };
  }

  // Simple products (and legacy colour-variant products, which are bought as
  // the product itself until migrated).
  const compare = product.originalPrice ?? product.comparePrice;
  const stock = product.stock ?? 0;
  return {
    price: product.price,
    comparePrice: compare && compare > product.price ? compare : undefined,
    hasPriceRange: false,
    inStock: stock > 0,
    lowStockLabel: stock > 0 && stock <= threshold ? `Only ${stock} left` : null,
    needsOptions: false,
    defaultVariantId: null,
    swatches: legacy.map((c) => ({ name: c.color, code: c.colorCode, image: c.images?.[0]?.url })),
    image: primaryImageUrl(product) ?? legacy[0]?.images?.[0]?.url,
  };
}
