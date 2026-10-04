'use client';

import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useHydrated } from '@/lib/useHydrated';

interface WishlistButtonProps {
  productId: string;
  /** Product name for a specific accessible label in lists. */
  productName?: string;
  /** overlay = on product imagery; outline = beside purchase buttons. */
  variant?: 'overlay' | 'outline';
  className?: string;
}

export default function WishlistButton({ productId, productName, variant = 'overlay', className }: WishlistButtonProps) {
  const hydrated = useHydrated();
  const { hasItem, toggleItem } = useWishlistStore();

  const isWishlisted = hydrated && hasItem(productId);
  const subject = productName ? ` ${productName}` : '';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(productId);
    toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isWishlisted}
      aria-label={isWishlisted ? `Remove${subject} from wishlist` : `Add${subject} to wishlist`}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-colors duration-150',
        variant === 'overlay'
          ? 'h-10 w-10 bg-surface/95 shadow-sm hover:bg-surface'
          : 'h-12 w-12 rounded-lg border border-border-strong bg-surface hover:bg-surface-muted',
        className
      )}
    >
      <Heart className={cn('h-5 w-5 transition-colors', isWishlisted ? 'fill-error text-error' : 'text-muted-foreground')} aria-hidden="true" />
    </button>
  );
}
