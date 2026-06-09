'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchProductReviews, createReview, deleteReview } from '@/lib/api/products';
import { toast } from 'sonner';
import type { CreateReviewPayload } from '@/types/review';

export function useProductReviews(slug: string, page = 1) {
  return useQuery({
    queryKey: ['reviews', slug, page],
    queryFn: () => fetchProductReviews(slug, page),
    staleTime: 60 * 1000,
  });
}

export function useAddReview(slug: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReview(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', slug] });
      queryClient.invalidateQueries({ queryKey: ['products', slug] });
      router.refresh();
      toast.success('Review submitted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || error.message || 'Failed to submit review';
      toast.error(message);
    },
  });
}

export function useDeleteReview(slug: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (id: string) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', slug] });
      queryClient.invalidateQueries({ queryKey: ['products', slug] });
      router.refresh();
      toast.success('Review deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete review');
    },
  });
}
