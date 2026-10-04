import { formatPrice, discountPercent } from '@/lib/formatters';
import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  comparePrice?: number;
  size?: 'sm' | 'md' | 'lg';
  /** Prefix for price ranges, e.g. "From". */
  prefix?: string;
  className?: string;
}

const PRICE_SIZE = { sm: 'text-base', md: 'text-lg', lg: 'text-2xl sm:text-3xl' };
const META_SIZE = { sm: 'text-sm', md: 'text-sm', lg: 'text-base' };

/** Selling price, then MRP (struck through) and the saving. Display only — amounts come from the API. */
export default function PriceDisplay({ price, comparePrice, size = 'md', prefix, className }: PriceDisplayProps) {
  const showDiscount = comparePrice != null && comparePrice > price;

  return (
    <div className={cn('flex flex-wrap items-baseline gap-x-2 gap-y-0.5 tabular-nums', className)}>
      {prefix && <span className={cn('text-muted-foreground', META_SIZE[size])}>{prefix}</span>}
      <span className={cn('font-bold text-foreground', PRICE_SIZE[size])}>{formatPrice(price)}</span>
      {showDiscount && (
        <>
          <span className={cn('text-subtle-foreground line-through', META_SIZE[size])}>
            <span className="sr-only">MRP </span>
            {formatPrice(comparePrice)}
          </span>
          <span className={cn('font-semibold text-success', META_SIZE[size])}>{discountPercent(price, comparePrice)}% off</span>
        </>
      )}
    </div>
  );
}
