'use client';

import { use } from 'react';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminProductForm from '@/components/admin/products/AdminProductForm';
import AdminProductImageManager from '@/components/admin/products/AdminProductImageManager';
import { useAdminProduct, useUpdateAdminProduct } from '@/hooks/useAdminProducts';
import type { ProductCreatePayload } from '@/types/product';

interface EditProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function AdminProductEditPage({ params }: EditProductPageProps) {
  const { slug } = use(params);
  const { data: product, isLoading, isError } = useAdminProduct(slug);
  const updateMutation = useUpdateAdminProduct();

  const handleSubmit = async (payload: ProductCreatePayload, _imageFiles: File[]) => {
    if (!product) return;
    await updateMutation.mutateAsync({ id: product._id, payload });
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
        {/* Images */}
        <AdminProductImageManager
          productId={product._id}
          productSlug={product.slug}
          images={product.images}
        />

        {/* Form */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <AdminProductForm
            initialData={product}
            onSubmit={handleSubmit}
            submitLabel="Save changes"
            isSubmitting={updateMutation.isPending}
            errorMessage={errorMessage}
          />
        </div>
      </div>
    </AdminPageShell>
  );
}
