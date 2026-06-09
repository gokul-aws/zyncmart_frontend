'use client';

import { Star, CheckCircle, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import type { Review } from '@/types/review';
import { useAuthStore } from '@/lib/store/authStore';
import { useDeleteReview } from '@/hooks/useReviews';

interface ReviewItemProps {
  review: Review;
  productSlug: string;
}

export default function ReviewItem({ review, productSlug }: ReviewItemProps) {
  const user = useAuthStore((state) => state.user);
  const deleteMutation = useDeleteReview(productSlug);

  const isOwner = user?._id === review.user._id;
  const isAdmin = user?.role === 'admin';

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteMutation.mutate(review._id);
    }
  };

  return (
    <div className="py-8 first:pt-0 last:pb-0 border-b border-gray-100 last:border-0">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* User Info & Rating */}
        <div className="w-full md:w-48 shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
              {review.user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{review.user.name}</p>
              <div className="flex items-center gap-1">
                {review.isVerifiedPurchase && (
                  <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                    <CheckCircle className="w-2.5 h-2.5" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-0.5 mb-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                  i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
        </div>

        {/* Content */}
        <div className="flex-1">
          {review.title && (
            <h4 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
              {review.title}
            </h4>
          )}
          <p className="text-sm text-gray-600 leading-relaxed">
            {review.body}
          </p>

          {review.images && review.images.length > 0 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {review.images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt="Review"
                  className="w-16 h-16 object-cover rounded-md border border-gray-100"
                />
              ))}
            </div>
          )}

          {(isOwner || isAdmin) && (
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="mt-4 flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
