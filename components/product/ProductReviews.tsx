'use client';

import { useState } from 'react';
import { Star, MessageSquare, PenSquare, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useProductReviews } from '@/hooks/useReviews';
import ReviewItem from './ReviewItem';
import AddReview from './AddReview';

interface ProductReviewsProps {
  ratings: { average: number; count: number };
  productSlug: string;
}

export default function ProductReviews({ ratings, productSlug }: ProductReviewsProps) {
  const [page, setPage] = useState(1);
  const [showAddReview, setShowAddReview] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  const { data, isLoading, isError, refetch } = useProductReviews(productSlug, page);

  const reviews = data?.data || [];
  const pagination = data?.pagination;
  
  const average = ratings?.average ?? 0;
  const count = ratings?.count ?? 0;
  const filled = Math.round(average);
  const bars = [5, 4, 3, 2, 1];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p className="text-sm">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-12">
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Rating Summary */}
        <div className="shrink-0 flex items-center lg:items-start gap-8 lg:flex-col lg:gap-4">
          <div className="text-center lg:text-left">
            <p className="text-6xl font-black text-gray-900 leading-tight">
              {average > 0 ? average.toFixed(1) : '0.0'}
            </p>
            <div className="flex justify-center lg:justify-start gap-0.5 mt-1">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                />
              ))}
            </div>
            <p className="text-sm font-medium text-gray-500 mt-2 uppercase tracking-wider">
              {count} review{count !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="hidden sm:flex flex-col gap-2 min-w-[200px]">
            {bars.map((star) => (
              <div key={star} className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-wide">
                <span className="w-4 text-right">{star}</span>
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{
                      width: count > 0
                        ? `${(reviews.filter(r => Math.round(r.rating) === star).length / (reviews.length || 1)) * 100}%`
                        : '0%'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="flex-1 bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
          <h4 className="text-lg font-bold text-gray-900 mb-2">Share your thoughts</h4>
          <p className="text-sm text-gray-600 mb-6 max-w-sm">
            If you've used this product, we'd love to hear your feedback. Your review helps other customers make better choices.
          </p>
          <button
            onClick={() => {
              if (isAuthenticated) {
                setShowAddReview(true);
              } else {
                window.location.href = `/login?redirect=/products/${productSlug}`;
              }
            }}
            className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-gray-800 transition-all active:scale-95"
          >
            <PenSquare className="w-4 h-4" />
            Write a Review
          </button>
        </div>
      </div>

      {/* Add Review Form Overlay/Section */}
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

      {/* Reviews List */}
      <div className="border-t border-gray-100 pt-12">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
              <MessageSquare className="w-8 h-8 text-gray-200" />
            </div>
            <div className="max-w-xs">
              <p className="font-bold text-gray-900 mb-1">No reviews yet</p>
              <p className="text-sm">Be the first to share your experience with this product.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900 tracking-tight font-display">
                Customer Reviews
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <ReviewItem key={review._id} review={review} productSlug={productSlug} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-gray-100">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 rounded-full border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-sm font-bold text-gray-900">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  disabled={page === pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 rounded-full border border-gray-200 disabled:opacity-30 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
