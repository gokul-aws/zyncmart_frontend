'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminProductForm from '@/components/admin/products/AdminProductForm';
import { createProduct, uploadProductImages, uploadVariantImages } from '@/lib/api/products';
import type { ProductCreatePayload } from '@/types/product';

export default function AdminProductCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (
    payload: ProductCreatePayload,
    imageFiles: File[],
    variantImageFiles: File[][]
  ) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const product = await createProduct(payload);

      if (imageFiles.length > 0) {
        await uploadProductImages(product._id, imageFiles);
      }

      if (payload.productType === 'variable' && variantImageFiles.length > 0) {
        // Variable product: upload images per variable variant.
        // These must run sequentially to avoid Mongoose document version conflicts.
        const variants = product.variants ?? [];
        for (let index = 0; index < variants.length; index++) {
          const files = variantImageFiles[index];
          if (!files?.length) continue;
          const variant = variants[index];
          if (!variant?._id) continue;
          await uploadVariantImages(product._id, variant._id, files);
        }
      } else if (variantImageFiles.length > 0) {
        // Legacy / edit-mode path (colorVariants): sequential upload
        const colorVariants = product.colorVariants ?? [];
        for (let index = 0; index < colorVariants.length; index++) {
          const files = variantImageFiles[index];
          if (!files?.length) continue;
          const variant = colorVariants[index];
          await uploadVariantImages(product._id, variant._id as string, files);
        }
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product created successfully.');
      router.push(`/admin/products/${product.slug}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ?? err?.message ?? 'Failed to create product.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminPageShell
      title="Create product"
      description="Add a new listing to the storefront with all product details and images."
    >
      <AdminProductForm
        onSubmit={handleSubmit}
        submitLabel="Create product"
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
      />
    </AdminPageShell>
  );
}
