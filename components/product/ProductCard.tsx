'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types/product';
import type { CartItem } from '@/types/cart';
import { useCartStore } from '@/lib/store/cartStore';
import { shareProduct } from '@/lib/share';
import StarRating from '@/components/ui/StarRating';
import PriceDisplay from '@/components/ui/PriceDisplay';
import WishlistButton from '@/components/ui/WishlistButton';

interface ProductCardProps {
  product: Product;
  view?: 'grid' | 'list';
  priority?: boolean;
}

export default function ProductCard({ product, view = 'grid', priority = false }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const primaryImage =
    product.images.find((i) => i.isPrimary)?.url ?? product.images[0]?.url;

  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  const isLowStock = product.stock > 0 && product.stock <= product.lowStockThreshold;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    const cartItem: CartItem = {
      productId: product._id,
      name: product.name,
      image: primaryImage ?? '',
      price: product.price,
      comparePrice: product.comparePrice,
      stock: product.stock,
      quantity: 1,
      slug: product.slug,
    };
    addItem(cartItem);
    toast.success('Added to cart', { description: product.name });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await shareProduct(product);
    if (result === 'copied') {
      toast.success('Link copied to clipboard');
    } else if (result === 'failed') {
      toast.error('Failed to share product');
    }
  };

  if (view === 'list') {
    return (
      <Link href={`/products/${product.slug}`} className="group flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
        <div className="relative w-28 h-28 flex-none rounded-lg overflow-hidden bg-gray-100">
          {primaryImage ? (
            <Image src={primaryImage} alt={product.name} fill className="object-cover" sizes="112px" priority={priority} />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 line-clamp-2">{product.name}</p>
          <div className="flex items-center gap-1.5">
            {product.ratings && product.ratings.count > 0 && (
              <span className="text-xs font-bold text-gray-700">{product.ratings.average.toFixed(1)}</span>
            )}
            <StarRating rating={product.ratings?.average ?? 0} count={product.ratings?.count ?? 0} />
          </div>
          <PriceDisplay price={product.price} comparePrice={product.comparePrice} size="sm" />
        </div>
        <div className="flex flex-col gap-2">
          <WishlistButton productId={product._id} />
          <button
            onClick={handleShare}
            aria-label="Share product"
            className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-primary hover:bg-primary/5 transition-colors shadow-sm"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </Link>
    );
  }

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Link href={`/products/${product.slug}`} className="group block bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                SALE
              </span>
            )}
            {isLowStock && !isOutOfStock && (
              <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                Only {product.stock} left
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                Out of Stock
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <div className="absolute top-2 right-2 flex flex-col gap-2">
            <WishlistButton productId={product._id} />
            <button
              onClick={handleShare}
              aria-label="Share product"
              className="p-2 rounded-full bg-white/90 text-gray-400 hover:text-primary hover:bg-white transition-all shadow-sm backdrop-blur-sm"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Quick-add (desktop hover) */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-2
                       bg-primary/95 text-white text-sm font-medium py-3
                       translate-y-full group-hover:translate-y-0
                       transition-transform duration-200
                       disabled:bg-gray-400 disabled:cursor-not-allowed
                       hidden md:flex"
          >
            <ShoppingCart className="w-4 h-4" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">
            {product.category.name}
          </p>
          <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1.5">
            {product.name}
          </p>
          <div className="flex items-center gap-1.5">
            {product.ratings && product.ratings.count > 0 && (
              <span className="text-xs font-bold text-gray-700">{product.ratings.average.toFixed(1)}</span>
            )}
            <StarRating rating={product.ratings?.average ?? 0} count={product.ratings?.count ?? 0} />
          </div>
          <div className="mt-1.5">
            <PriceDisplay price={product.price} comparePrice={product.comparePrice} size="sm" />
          </div>

          {/* Mobile add-to-cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="mt-2 w-full flex items-center justify-center gap-1.5 bg-primary text-white
                       text-xs font-medium py-2 rounded-lg
                       disabled:bg-gray-300 disabled:cursor-not-allowed
                       md:hidden transition-colors active:opacity-80"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    </motion.div>
  );
}
