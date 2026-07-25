'use client';

import { use } from 'react';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminProductForm from '@/components/admin/products/AdminProductForm';
import { useAdminProduct, useUpdateAdminProduct } from '@/hooks/useAdminProducts';
import {
  uploadProductImages,
  removeProductImage,
  reorderProductImages,
  setPrimaryImage,
  uploadVariantImages,
  removeVariantImage,
} from '@/lib/api/products';
import type { ProductCreatePayload } from '@/types/product';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface EditProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function AdminProductEditPage({ params }: EditProductPageProps) {
  const { slug } = use(params);
  const { data: product, isLoading, isError } = useAdminProduct(slug);
  const updateMutation = useUpdateAdminProduct();
  const queryClient = useQueryClient();

  const handleSubmit = async (
    payload: ProductCreatePayload,
    imageFiles: File[],
    variantImageFiles: File[][]
  ) => {
    if (!product) return;
    await updateMutation.mutateAsync({ id: product._id, payload });

    if (imageFiles.length > 0) {
      await uploadProductImages(product._id, imageFiles);
    }

    if (payload.productType === 'variable' && variantImageFiles.length > 0) {
      const updatedVariants = product.variants ?? [];
      for (let index = 0; index < updatedVariants.length; index++) {
        const files = variantImageFiles[index];
        if (!files?.length) continue;
        const variant = updatedVariants[index];
        if (!variant?._id) continue;
        await uploadVariantImages(product._id, variant._id, files);
      }
    }

    queryClient.invalidateQueries({ queryKey: ['admin', 'product', slug] });
    toast.success('Product updated');
  };

  const handleRemoveImage = async (publicId: string) => {
    if (!product) return;
    await removeProductImage(product._id, publicId);
  };

  const handleSetPrimaryImage = async (publicId: string) => {
    if (!product) return;
    await setPrimaryImage(product._id, publicId);
  };

  const handleReorderImages = async (
    images: { publicId: string; isPrimary: boolean }[]
  ) => {
    if (!product) return;
    await reorderProductImages(product._id, images);
  };

  const handleRemoveVariantImage = async (variantId: string, publicId: string) => {
    if (!product) return;
    await removeVariantImage(product._id, variantId, publicId);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        Loading product…
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-rose-700 shadow-sm dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
        <p className="text-lg font-semibold">Unable to load product for editing.</p>
        <p className="mt-2 text-sm">Please go back and select another product.</p>
      </div>
    );
  }

  const errorMessage = updateMutation.isError
    ? ((updateMutation.error as any)?.response?.data?.message ??
      (updateMutation.error as Error)?.message ??
      null)
    : null;

  return (
    <AdminPageShell
      title="Edit product"
      description="Update product details, pricing, and metadata for this listing."
    >
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <AdminProductForm
            initialData={product}
            onSubmit={handleSubmit}
            onRemoveImage={handleRemoveImage}
            onSetPrimaryImage={handleSetPrimaryImage}
            onReorderImages={handleReorderImages}
            onRemoveVariantImage={handleRemoveVariantImage}
            submitLabel="Save changes"
            isSubmitting={updateMutation.isPending}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </AdminPageShell>
  );
}
