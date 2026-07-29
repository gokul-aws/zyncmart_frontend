import type { Product, ProductFilters, ProductCreatePayload, ProductUpdatePayload } from '@/types/product';
import type { PaginatedResponse, ApiResponse } from '@/types/api';
import type { Review, CreateReviewPayload } from '@/types/review';
import api from './axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchProducts(
  filters: ProductFilters = {}
): Promise<PaginatedResponse<Product>> {
  if (!BASE_URL) return { success: false, data: [], pagination: { page: 1, limit: 10, total: 0, pages: 0 } };

  const params = new URLSearchParams();
  (Object.keys(filters) as (keyof ProductFilters)[]).forEach((key) => {
    const value = filters[key];
    if (value !== undefined && value !== null) {
      params.set(key, Array.isArray(value) ? value.join(',') : String(value));
    }
  });

  const res = await fetch(
    `${BASE_URL}/products${params.toString() ? `?${params}` : ''}`,
    filters.search ? { cache: 'no-store' } : { next: { revalidate: 3600 } }
  );

  if (!res.ok) throw new Error(`fetchProducts failed: ${res.status}`);
  return res.json();
}

export const fetchFeaturedProducts = () =>
  fetchProducts({ isFeatured: true, limit: 10 });

export const fetchNewArrivals = () =>
  fetchProducts({ sortBy: 'newest', limit: 8 });

export const fetchBestSellers = () =>
  fetchProducts({ sortBy: 'rating', limit: 8 });

export async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${BASE_URL}/products/${slug}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`fetchProduct failed: ${res.status}`);

  const json = await res.json();
  return json.data as Product;
}

export async function fetchAdminProducts(
  filters: ProductFilters = {}
): Promise<PaginatedResponse<Product>> {
  // Dedicated admin endpoint — unlike the public GET /products, this doesn't
  // force isActive=true, so the Status filter (and inactive/deleted
  // products) actually work in the admin listing.
  const { data } = await api.get<PaginatedResponse<Product>>('/admin/products', {
    params: filters,
  });
  return data;
}

export async function createProduct(
  payload: ProductCreatePayload
): Promise<Product> {
  const { data } = await api.post<ApiResponse<Product>>('/products', payload);
  return data.data;
}

export async function updateProduct(
  id: string,
  payload: ProductUpdatePayload
): Promise<Product> {
  const { data } = await api.put<ApiResponse<Product>>(`/products/${id}`, payload);
  return data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  const { data } = await api.delete<ApiResponse<void>>(`/products/${id}`);
  return data.data;
}

export async function uploadProductImages(
  productId: string,
  files: File[],
  onProgress?: (percent: number) => void
): Promise<void> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const { data } = await api.post<ApiResponse<void>>(
    `/products/${productId}/images`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    }
  );

  return data.data;
}

export async function removeProductImage(
  productId: string,
  publicId: string
): Promise<void> {
  const { data } = await api.delete<ApiResponse<void>>(
    `/products/${productId}/images/${encodeURIComponent(publicId)}`
  );
  return data.data;
}

export async function reorderProductImages(
  productId: string,
  images: { publicId: string; isPrimary: boolean }[]
): Promise<void> {
  const { data } = await api.put<ApiResponse<void>>(
    `/products/${productId}/images/reorder`,
    { images }
  );
  return data.data;
}

export async function setPrimaryImage(
  productId: string,
  publicId: string
): Promise<void> {
  const { data } = await api.put<ApiResponse<void>>(
    `/products/${productId}/images/${encodeURIComponent(publicId)}/primary`
  );
  return data.data;
}

export async function uploadVariantImages(
  productId: string,
  variantId: string,
  files: File[],
  onProgress?: (percent: number) => void
): Promise<void> {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));

  const { data } = await api.post<ApiResponse<void>>(
    `/products/${productId}/variants/${variantId}/images`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded * 100) / event.total));
        }
      },
    }
  );

  return data.data;
}

export async function removeVariantImage(
  productId: string,
  variantId: string,
  publicId: string
): Promise<void> {
  const { data } = await api.delete<ApiResponse<void>>(
    `/products/${productId}/variants/${variantId}/images/${encodeURIComponent(publicId)}`
  );
  return data.data;
}

// Review APIs
export async function fetchProductReviews(
  slug: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<Review>> {
  const res = await fetch(`${BASE_URL}/reviews/${slug}/reviews?page=${page}&limit=${limit}`, {
    cache: 'no-store', // Reviews should be fresh
  });
  if (!res.ok) throw new Error(`fetchProductReviews failed: ${res.status}`);
  return res.json();
}

export async function createReview(
  slug: string,
  payload: CreateReviewPayload
): Promise<ApiResponse<Review>> {
  const { data } = await api.post(`/reviews/${slug}/reviews`, payload);
  return data;
}

export async function deleteReview(id: string): Promise<ApiResponse<void>> {
  const { data } = await api.delete(`/reviews/${id}`);
  return data;
}
