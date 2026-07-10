export interface ProductImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  name: string;
  options: string[];
}

// A true per-color variant: its own images, stock, SKU, and an optional
// price override. Distinct from ProductVariant above, which is just a
// generic option-group label (e.g. Size) with no price/stock/image of its own.
export interface ColorVariant {
  _id?: string;
  color: string;
  colorCode?: string;
  images: ProductImage[];
  stock: number;
  sku: string;
  price?: number;
}

// The subset of ColorVariant fields the admin form submits — images are
// managed independently via uploadVariantImages, mirroring how top-level
// product images are handled outside the create/update payload.
export interface ColorVariantInput {
  _id?: string;
  color: string;
  colorCode?: string;
  sku: string;
  stock: number;
  price?: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: { _id: string; name: string; slug: string };
  brand?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  lowStockThreshold: number;
  weight?: number;
  images: ProductImage[];
  variants: ProductVariant[];
  colorVariants: ColorVariant[];
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  ratings: { average: number; count: number };
  createdAt: string;
}

export interface ProductCreatePayload {
  name: string;
  slug?: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  brand?: string;
  sku: string;
  price: number;
  comparePrice?: number;
  stock: number;
  lowStockThreshold: number;
  weight?: number;
  variants?: ProductVariant[];
  colorVariants: ColorVariantInput[];
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  images?: ProductImage[];
}

export interface ProductUpdatePayload extends ProductCreatePayload {}

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
