'use client';

import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useWishlistStore } from '@/lib/store/wishlistStore';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = '' }: WishlistButtonProps) {
  const [mounted, setMounted] = useState(false);
  const { hasItem, toggleItem } = useWishlistStore();

  useEffect(() => setMounted(true), []);

  const isWishlisted = mounted && hasItem(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(productId);
    toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <button
      onClick={handleClick}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`p-1.5 rounded-full bg-white/90 shadow-sm hover:bg-white transition-colors ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500 hover:text-red-400'
        }`}
      />
    </button>
  );
}
