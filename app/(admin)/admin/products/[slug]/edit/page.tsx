'use client';

import { use } from 'react';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminProductForm from '@/components/admin/products/AdminProductForm';
import AdminProductImageManager from '@/components/admin/products/AdminProductImageManager';
import AdminProductVariantImageManager from '@/components/admin/products/AdminProductVariantImageManager';
import { useAdminProduct, useUpdateAdminProduct } from '@/hooks/useAdminProducts';
import type { ProductCreatePayload } from '@/types/product';

interface EditProductPageProps {
  params: Promise<{ slug: string }>;
}

// TODO: Product Images upload section temporarily disabled — images are now
// managed per color variant instead (see AdminProductVariantImageManager
// below). Flip back to `true` to restore. (Typed as `boolean`, not a literal
// `false`, so TS doesn't treat the guarded JSX as unreachable and widen
// narrowing inside it.)
const SHOW_LEGACY_PRODUCT_IMAGES: boolean = false;

export default function AdminProductEditPage({ params }: EditProductPageProps) {
  const { slug } = use(params);
  const { data: product, isLoading, isError } = useAdminProduct(slug);
  const updateMutation = useUpdateAdminProduct();

  const handleSubmit = async (
    payload: ProductCreatePayload,
    _imageFiles: File[],
    _variantImageFiles: File[][]
  ) => {
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
        {SHOW_LEGACY_PRODUCT_IMAGES && (
          <AdminProductImageManager
            productId={product._id}
            productSlug={product.slug}
            images={product.images}
          />
        )}

        {/* Per-color-variant images */}
        {(product.colorVariants?.length ?? 0) > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Color variant images
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {product.colorVariants.map((variant) => (
                <AdminProductVariantImageManager
                  key={variant._id}
                  productId={product._id}
                  productSlug={product.slug}
                  variantId={variant._id as string}
                  color={variant.color}
                  colorCode={variant.colorCode}
                  images={variant.images}
                />
              ))}
            </div>
          </div>
        )}

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
