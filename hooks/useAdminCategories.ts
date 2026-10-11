'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryPayload,
} from '@/lib/api/categories';
import { toast } from 'sonner';
import { revalidateCategories } from '@/lib/actions/revalidateCategories';

function errorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { error?: string; message?: string } }; message?: string };
  return err?.response?.data?.error || err?.response?.data?.message || err?.message || fallback;
}

function invalidateCategoryQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
  queryClient.invalidateQueries({ queryKey: ['categories'] });
  revalidateCategories().catch(() => {});
}

export function useAdminCategories() {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchAdminCategories,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, imageFile }: { payload: CreateCategoryPayload; imageFile?: File }) =>
      createCategory(payload, imageFile),
    onSuccess: () => {
      invalidateCategoryQueries(queryClient);
      toast.success('Category created successfully');
    },
    onError: (error) => {
      toast.error(errorMessage(error, 'Failed to create category'));
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload, imageFile }: { id: string; payload: Partial<CreateCategoryPayload>; imageFile?: File }) =>
      updateCategory(id, payload, imageFile),
    onSuccess: () => {
      invalidateCategoryQueries(queryClient);
      toast.success('Category updated successfully');
    },
    onError: (error) => {
      toast.error(errorMessage(error, 'Failed to update category'));
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      invalidateCategoryQueries(queryClient);
      toast.success('Category deactivated');
    },
    onError: (error) => {
      toast.error(errorMessage(error, 'Failed to delete category'));
    },
  });
}

export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => updateCategory(id, { isActive }),
    onSuccess: (category) => {
      invalidateCategoryQueries(queryClient);
      toast.success(category.isActive ? 'Category activated' : 'Category deactivated');
    },
    onError: (error) => {
      toast.error(errorMessage(error, 'Failed to update category status'));
    },
  });
}
