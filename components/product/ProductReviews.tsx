'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, PenSquare } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useProductReviews } from '@/hooks/useReviews';
import StarRating from '@/components/ui/StarRating';
import Button from '@/components/ui/Button';
import Pagination from '@/components/ui/Pagination';
import Spinner from '@/components/ui/Spinner';
import Alert from '@/components/ui/Alert';
import ReviewItem from './ReviewItem';
import AddReview from './AddReview';

interface ProductReviewsProps {
  ratings: { average: number; count: number };
  productSlug: string;
}

export default function ProductReviews({ ratings, productSlug }: ProductReviewsProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [showAddReview, setShowAddReview] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const { data, isLoading, isError, refetch } = useProductReviews(productSlug, page);
  const reviews = data?.data || [];
  const pagination = data?.pagination;

  const average = ratings?.average ?? 0;
  const count = ratings?.count ?? 0;

  const startReview = () => {
    if (isAuthenticated) setShowAddReview(true);
    else router.push(`/login?redirect=/products/${productSlug}`);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Summary from the product's own rating totals (all reviews). */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-4xl font-bold tabular-nums text-foreground">{average > 0 ? average.toFixed(1) : '–'}</p>
          <div>
            <StarRating rating={average} size="md" />
            <p className="mt-1 text-sm text-muted-foreground">
              {count === 0 ? 'No reviews yet' : `Based on ${count} review${count === 1 ? '' : 's'}`}
            </p>
          </div>
        </div>
        {!showAddReview && (
          <Button variant="outline" onClick={startReview}>
            <PenSquare className="h-4 w-4" aria-hidden="true" />
            Write a review
          </Button>
        )}
      </div>

      {showAddReview && (
        <AddReview
          productSlug={productSlug}
          onSuccess={() => {
            setShowAddReview(false);
            refetch();
          }}
          onCancel={() => setShowAddReview(false)}
        />
      )}

      {isLoading ? (
        <div className="flex justify-center py-10">
          <Spinner label="Loading reviews" />
        </div>
      ) : isError ? (
        <Alert
          variant="error"
          title="Reviews could not be loaded"
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          }
        />
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border-strong px-4 py-10 text-center">
          <MessageSquare className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="font-semibold text-foreground">No reviews yet</p>
          <p className="text-sm text-muted-foreground">Be the first to share your experience with this product.</p>
        </div>
      ) : (
        <div>
          <h3 className="sr-only">Customer reviews</h3>
          <ul className="divide-y divide-border">
            {reviews.map((review) => (
              <li key={review._id}>
                <ReviewItem review={review} productSlug={productSlug} />
              </li>
            ))}
          </ul>
          {pagination && <Pagination page={page} pages={pagination.pages} onPageChange={setPage} className="mt-8" />}
        </div>
      )}
    </div>
  );
}
