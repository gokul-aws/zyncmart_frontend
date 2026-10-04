'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Star } from 'lucide-react';
import { useAddReview } from '@/hooks/useReviews';
import Field from '@/components/ui/Field';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  title: z.string().min(3, 'Title is too short').max(100).optional().or(z.literal('')),
  body: z.string().min(10, 'Review is too short').max(1000),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

interface AddReviewProps {
  productSlug: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export default function AddReview({ productSlug, onSuccess, onCancel }: AddReviewProps) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const addReviewMutation = useAddReview(productSlug);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, title: '', body: '' },
  });

  const rating = watch('rating');

  const onSubmit = (data: ReviewFormValues) => {
    addReviewMutation.mutate(
      { ...data, title: data.title || undefined },
      { onSuccess: () => onSuccess?.() }
    );
  };

  return (
    <Card>
      <h3 className="mb-5 text-lg font-semibold text-foreground">Write a review</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Star rating as a radio group: keyboard arrows work natively. */}
        <fieldset aria-describedby={errors.rating ? 'review-rating-error' : undefined}>
          <legend className="mb-2 text-sm font-medium text-foreground">
            Rating<span className="text-error" aria-hidden="true"> *</span>
          </legend>
          <div className="flex items-center gap-1" onMouseLeave={() => setHoveredRating(0)}>
            {[1, 2, 3, 4, 5].map((star) => (
              <label key={star} className="cursor-pointer rounded-md p-1 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-primary" onMouseEnter={() => setHoveredRating(star)}>
                <input
                  type="radio"
                  name="rating"
                  value={star}
                  checked={rating === star}
                  onChange={() => setValue('rating', star, { shouldValidate: true })}
                  className="sr-only"
                />
                <span className="sr-only">
                  {star} star{star === 1 ? '' : 's'}, {LABELS[star]}
                </span>
                <Star className={cn('h-8 w-8', star <= (hoveredRating || rating) ? 'fill-amber-500 text-amber-500' : 'fill-gray-200 text-gray-300')} aria-hidden="true" />
              </label>
            ))}
            {(hoveredRating || rating) > 0 && <span className="ml-2 text-sm text-muted-foreground">{LABELS[hoveredRating || rating]}</span>}
          </div>
          {errors.rating && (
            <p id="review-rating-error" className="mt-1.5 text-sm font-medium text-error">
              {errors.rating.message}
            </p>
          )}
        </fieldset>

        <Field label="Title" hint="Optional" error={errors.title?.message}>
          <Input {...register('title')} placeholder="Sum up your experience" />
        </Field>

        <Field label="Your review" required error={errors.body?.message}>
          <Textarea {...register('body')} rows={4} placeholder="What did you like or dislike? How was the quality?" />
        </Field>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" loading={addReviewMutation.isPending}>
            Submit review
          </Button>
        </div>
      </form>
    </Card>
  );
}
