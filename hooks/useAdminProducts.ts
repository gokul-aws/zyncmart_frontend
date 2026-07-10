'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  fetchAdminProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  removeProductImage,
  uploadVariantImages,
  removeVariantImage,
} from '@/lib/api/products';
import type {
  Product,
  ProductCreatePayload,
  ProductFilters,
  ProductUpdatePayload,
} from '@/types/product';

export function useAdminProducts(filters: ProductFilters) {
  return useQuery({
    queryKey: ['admin', 'products', filters],
    queryFn: () => fetchAdminProducts(filters),
    staleTime: 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useAdminProduct(slug: string) {
  return useQuery({
    queryKey: ['admin', 'product', slug],
    queryFn: () => fetchProduct(slug),
    staleTime: 60 * 1000,
  });
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: ProductCreatePayload) => createProduct(payload),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product created successfully.');
      router.push(`/admin/products/${product.slug}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to create product.');
    },
  });
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProductUpdatePayload }) =>
      updateProduct(id, payload),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', product.slug] });
      toast.success('Product updated successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update product.');
    },
  });
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product deleted successfully.');
      router.push('/admin/products');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to delete product.');
    },
  });
}

export function useBulkDeleteAdminProducts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => deleteProduct(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Selected products deleted successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to delete selected products.');
    },
  });
}

export function useToggleAdminProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateProduct(id, { isActive }),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', product.slug] });
      toast.success('Product visibility updated.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to update product status.');
    },
  });
}

export function useUploadAdminProductImages(productSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      files,
      onProgress,
    }: {
      productId: string;
      files: File[];
      onProgress?: (percent: number) => void;
    }) => uploadProductImages(productId, files, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productSlug] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product images uploaded successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to upload images.');
    },
  });
}

export function useDeleteAdminProductImage(productSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, publicId }: { productId: string; publicId: string }) =>
      removeProductImage(productId, publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productSlug] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Image removed successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to remove image.');
    },
  });
}

export function useUploadAdminVariantImages(productSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      files,
      onProgress,
    }: {
      productId: string;
      variantId: string;
      files: File[];
      onProgress?: (percent: number) => void;
    }) => uploadVariantImages(productId, variantId, files, onProgress),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productSlug] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Color variant images uploaded successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to upload color variant images.');
    },
  });
}

export function useDeleteAdminVariantImage(productSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      variantId,
      publicId,
    }: {
      productId: string;
      variantId: string;
      publicId: string;
    }) => removeVariantImage(productId, variantId, publicId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'product', productSlug] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Image removed successfully.');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to remove image.');
    },
  });
}
