export interface ProductImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
}

export interface ProductVariant {
  name: string;
  options: string[];
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
  tags?: string[];
  isFeatured?: boolean;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  images?: ProductImage[];
}

export interface ProductUpdatePayload extends Partial<ProductCreatePayload> {}

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
