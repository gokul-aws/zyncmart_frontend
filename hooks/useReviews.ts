'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchProductReviews, createReview, deleteReview } from '@/lib/api/products';
import { revalidateProducts } from '@/lib/actions/revalidate';
import { toast } from 'sonner';
import type { CreateReviewPayload } from '@/types/review';

export function useProductReviews(slug: string, page = 1) {
  return useQuery({
    queryKey: ['reviews', slug, page],
    queryFn: () => fetchProductReviews(slug, page),
    staleTime: 60 * 1000,
  });
}

/**
 * A review changes the PRODUCT's denormalized ratings.average/count/
 * distribution, not just the review list — both cache layers that can hold
 * that product data need to be busted:
 *  - React Query's ['product', slug] (NOT the previous ['products', slug] —
 *    that key was never actually used by anything; useProduct() reads
 *    ['product', slug], singular, so the old invalidation call was a no-op
 *    and the cached product/ratings never refreshed after a review).
 *  - The Next.js server Data Cache, via the same Server Action the admin
 *    mutations use — router.refresh() alone re-renders the Server
 *    Component tree, but its underlying fetchProduct() call is still
 *    cache-tagged and won't actually re-fetch unless that tag is busted.
 */
function invalidateProductAfterReview(qc: ReturnType<typeof useQueryClient>, slug: string) {
  qc.invalidateQueries({ queryKey: ['product', slug] });
  qc.invalidateQueries({ queryKey: ['products'] });
  revalidateProducts(slug).catch(() => {
    // Non-fatal — the 1-hour ISR ceiling still applies as a fallback.
  });
}

export function useAddReview(slug: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => createReview(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', slug] });
      invalidateProductAfterReview(queryClient, slug);
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
      invalidateProductAfterReview(queryClient, slug);
      router.refresh();
      toast.success('Review deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete review');
    },
  });
}
