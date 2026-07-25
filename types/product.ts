export interface ProductImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

// ── Legacy generic option-group variant (display-only, no price/stock) ──────
export interface ProductVariant {
  name: string;
  options: string[];
}

// ── Backend variant (matches productVariantSchema) ──────────────────────────
export interface BackendProductVariant {
  _id?: string;
  sku: string;
  color: {
    name: string;
    code?: string;
  };
  size?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
}

// ── Legacy per-color variant (pre productType redesign) ─────────────────────
export interface ColorVariant {
  _id?: string;
  color: string;
  colorCode?: string;
  images: ProductImage[];
  stock: number;
  sku: string;
  price?: number;
  originalPrice?: number;
}

export interface ColorVariantInput {
  _id?: string;
  color: string;
  colorCode?: string;
  sku: string;
  stock: number;
  price?: number;
}

// ── Variable product variant (admin form input shape) ───────────────────────
export type ProductType = 'simple' | 'variable';

export interface VariableProductVariant {
  _id?: string;
  sku: string;
  color: string;
  colorCode?: string;
  size: string;
  price: number;
  originalPrice?: number;
  stock: number;
  image?: string;
}

export interface VariableProductVariantInput {
  _id?: string;
  sku: string;
  color: { name: string; code: string };
  size: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

// ── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  _id: string;
  productType?: ProductType;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: { _id: string; name: string; slug: string };
  brand?: string;
  sku: string;
  price: number;
  originalPrice?: number;
  comparePrice?: number;
  stock: number;
  lowStockThreshold: number;
  weight?: number;
  images: ProductImage[];
  // Backend canonical variants (for variable products)
  variants: BackendProductVariant[];
  // Legacy fields (may still exist for old products)
  colorVariants?: ColorVariant[];
  // Legacy generic option groups
  legacyVariants?: ProductVariant[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ratings: { average: number; count: number };
  createdAt: string;
}

export interface ProductCreatePayload {
  productType?: ProductType;
  name: string;
  slug?: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  brand?: string;
  sku?: string;
  price?: number;
  originalPrice?: number;
  comparePrice?: number;
  stock?: number;
  lowStockThreshold?: number;
  weight?: number;
  // New variable variants (sent as variableVariants to backend)
  variableVariants?: VariableProductVariantInput[];
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  images?: ProductImage[];
}

export type ProductUpdatePayload = Partial<ProductCreatePayload>;

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  inStock?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  search?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  page?: number;
  limit?: number;
}
