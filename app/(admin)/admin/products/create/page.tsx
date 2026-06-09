'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import AdminPageShell from '@/components/admin/AdminPageShell';
import AdminProductForm from '@/components/admin/products/AdminProductForm';
import { createProduct, uploadProductImages } from '@/lib/api/products';
import type { ProductCreatePayload } from '@/types/product';

export default function AdminProductCreatePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (payload: ProductCreatePayload, imageFiles: File[]) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const product = await createProduct(payload);

      if (imageFiles.length > 0) {
        await uploadProductImages(product._id, imageFiles);
      }

      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      toast.success('Product created successfully.');
      router.push(`/admin/products/${product.slug}`);
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <AdminProductForm
          onSubmit={handleSubmit}
          submitLabel="Create product"
          isSubmitting={isSubmitting}
          errorMessage={errorMessage}
        />
      </div>
    </AdminPageShell>
  );
}
