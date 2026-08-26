'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryPayload,
} from '@/lib/api/categories';
import { revalidateCategories } from '@/lib/actions/revalidate';
import type { Category } from '@/types/category';
import { toast } from 'sonner';

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await fetchCategories();
      return res.data || [];
    },
  });
}

/**
 * Invalidate every cache layer that can hold storefront category data —
 * this browser's React Query cache (the customer-facing ['categories'] key
 * used by the nav bar/filters, previously only ['admin-categories'] was
 * touched here) and the Next.js server-side Data Cache via a tag-scoped
 * Server Action, so other visitors' server-rendered pages (homepage,
 * category nav, category pages) don't wait out the 1-hour ISR ceiling.
 */
function invalidateStorefrontCategoryQueries(qc: ReturnType<typeof useQueryClient>, slug?: string) {
  qc.invalidateQueries({ queryKey: ['admin-categories'] });
  qc.invalidateQueries({ queryKey: ['categories'] });
  revalidateCategories(slug).catch(() => {
    // Non-fatal — the 1-hour ISR ceiling still applies as a fallback.
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, imageFile }: { payload: CreateCategoryPayload; imageFile?: File }) =>
      createCategory(payload, imageFile),
    onSuccess: (category) => {
      invalidateStorefrontCategoryQueries(queryClient, category.slug);
      toast.success('Category created successfully');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create category';
      toast.error(message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, imageFile }: { id: string; payload: Partial<CreateCategoryPayload>; imageFile?: File }) =>
      updateCategory(id, payload, imageFile),
    onSuccess: (category) => {
      invalidateStorefrontCategoryQueries(queryClient, category.slug);
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update category';
      toast.error(message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      invalidateStorefrontCategoryQueries(queryClient);
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      toast.error(message);
    },
  });
}
