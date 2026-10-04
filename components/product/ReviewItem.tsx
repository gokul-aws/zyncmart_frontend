'use client';

import { useState } from 'react';
import { CheckCircle, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Review } from '@/types/review';
import { useAuthStore } from '@/lib/store/authStore';
import { useDeleteReview } from '@/hooks/useReviews';
import StarRating from '@/components/ui/StarRating';
import Badge from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Dialog';

interface ReviewItemProps {
  review: Review;
  productSlug: string;
}

export default function ReviewItem({ review, productSlug }: ReviewItemProps) {
  const user = useAuthStore((state) => state.user);
  const deleteMutation = useDeleteReview(productSlug);
  const [confirming, setConfirming] = useState(false);

  const isOwner = user?._id === review.user._id;
  const isAdmin = user?.role === 'admin';

  return (
    <article className="py-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <StarRating rating={review.rating} />
        {review.title && <h4 className="text-sm font-semibold text-foreground">{review.title}</h4>}
      </div>
      <p className="mt-2 text-base leading-relaxed text-foreground/90">{review.body}</p>

      {review.images && review.images.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {review.images.map((img, idx) => (
            // eslint-disable-next-line @next/next/no-img-element -- review photos can come from hosts not configured for next/image
            <img key={idx} src={img} alt={`Photo ${idx + 1} from ${review.user.name}'s review`} loading="lazy" className="h-16 w-16 rounded-md border border-border object-cover" />
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{review.user.name}</span>
        {review.isVerifiedPurchase && (
          <Badge variant="success">
            <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Verified purchase
          </Badge>
        )}
        <span>{formatDate(review.createdAt)}</span>
        {(isOwner || isAdmin) && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={deleteMutation.isPending}
            className="inline-flex h-9 items-center gap-1.5 rounded-md px-2 font-medium text-error hover:bg-error-subtle disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Delete
          </button>
        )}
      </div>

      <ConfirmDialog
        open={confirming}
        title="Delete this review?"
        description="This can't be undone."
        confirmLabel="Delete review"
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setConfirming(false)}
        onConfirm={() => deleteMutation.mutate(review._id, { onSettled: () => setConfirming(false) })}
      />
    </article>
  );
}
