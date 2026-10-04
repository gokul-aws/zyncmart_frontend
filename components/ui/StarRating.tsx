import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
  /** Show the numeric average before the stars. */
  showValue?: boolean;
  className?: string;
}

export default function StarRating({ rating, count, size = 'sm', showValue = false, className }: StarRatingProps) {
  const filled = Math.round(rating);
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {showValue && <span className="text-sm font-semibold tabular-nums text-foreground" aria-hidden="true">{rating.toFixed(1)}</span>}
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} className={cn(dim, i < filled ? 'fill-amber-500 text-amber-500' : 'fill-gray-200 text-gray-200')} />
        ))}
      </span>
      <span className="sr-only">
        Rated {rating.toFixed(1)} out of 5{count !== undefined ? `, ${count} review${count === 1 ? '' : 's'}` : ''}
      </span>
      {count !== undefined && (
        <span className="text-xs tabular-nums text-muted-foreground" aria-hidden="true">
          ({count})
        </span>
      )}
    </div>
  );
}
