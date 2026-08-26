'use client';

import { Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { useAuthStore } from '@/lib/store/authStore';
import { useSubmitGuard } from '@/hooks/useSubmitGuard';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = '' }: WishlistButtonProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { hasItem, toggleItem } = useWishlistStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const guard = useSubmitGuard();

  useEffect(() => setMounted(true), []);

  const isWishlisted = mounted && hasItem(productId);

  const handleClick = (e: React.MouseEvent) => guard(async () => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast.info('Please log in to save items to your wishlist.');
      router.push('/login');
      return;
    }

    const wasWishlisted = isWishlisted;
    try {
      await toggleItem(productId);
      toast(wasWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  });

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
