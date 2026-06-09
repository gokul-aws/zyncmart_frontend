'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type CreateCategoryPayload,
} from '@/lib/api/categories';
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

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, imageFile }: { payload: CreateCategoryPayload; imageFile?: File }) =>
      createCategory(payload, imageFile),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
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
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted successfully');
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to delete category';
      toast.error(message);
    },
  });
}
