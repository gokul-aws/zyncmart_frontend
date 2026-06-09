'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Zap,
  Heart,
  Share2,
  MessageCircle,
  Check,
  MapPin,
  Truck,
  Shield,
  RotateCcw,
} from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import PriceDisplay from '@/components/ui/PriceDisplay';
import ProductVariants from './ProductVariants';
import QuantitySelector from '@/components/ui/QuantitySelector';
import ProductShare from './ProductShare';
import { useCartStore } from '@/lib/store/cartStore';
import { useWishlistStore } from '@/lib/store/wishlistStore';
import { GA } from '@/lib/analytics';
import type { Product } from '@/types/product';

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

interface ProductInfoProps {
  product: Product;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const router = useRouter();
  const { addItem, toggleDrawer } = useCartStore();
  const { hasItem, toggleItem } = useWishlistStore();

  const primaryImage =
    product.images.find((i) => i.isPrimary) ?? product.images[0];

  // Variant state: default to first option of each variant
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.variants.map((v) => [v.name, v.options[0] ?? '']))
  );
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeMsg, setPincodeMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Fire view_item GA4 event once on mount
  useEffect(() => {
    GA.viewItem(product);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  // Wishlist hydration guard (localStorage)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isWishlisted = mounted && hasItem(product._id);

  const outOfStock = product.stock === 0;
  const lowStock = !outOfStock && product.stock <= product.lowStockThreshold;
  const variantLabel =
    Object.values(selected).filter(Boolean).join(' / ') || undefined;

  const buildCartItem = () => ({
    productId: product._id,
    name: product.name,
    image: primaryImage?.url ?? '',
    price: product.price,
    comparePrice: product.comparePrice,
    stock: product.stock,
    quantity,
    variant: variantLabel,
    slug: product.slug,
  });

  const handleAddToCart = () => {
    if (outOfStock) return;
    addItem(buildCartItem());
    toggleDrawer();
    toast.success('Added to cart', { description: product.name });
    GA.addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    if (outOfStock) return;
    addItem(buildCartItem());
    router.push('/checkout');
  };

  const handleWishlist = () => {
    toggleItem(product._id);
    toast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const checkPincode = () => {
    if (!/^\d{6}$/.test(pincode)) {
      setPincodeMsg({ ok: false, text: 'Enter a valid 6-digit pincode' });
      return;
    }
    const date = new Date();
    date.setDate(date.getDate() + 5);
    const formatted = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    setPincodeMsg({ ok: true, text: `Estimated delivery by ${formatted}` });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Category + Brand */}
      <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-wide">
        <Link
          href={`/products?category=${product.category.slug}`}
          className="hover:text-primary transition-colors"
        >
          {product.category.name}
        </Link>
        {product.brand && (
          <>
            <span aria-hidden="true">·</span>
            <span>{product.brand}</span>
          </>
        )}
      </div>

      {/* Product name */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug font-display">
        {product.name}
      </h1>

      {/* Rating */}
      {product.ratings && product.ratings.count > 0 && (
        <a href="#reviews" className="flex items-center gap-2 w-fit group">
          <span className="text-sm font-bold text-gray-900">{product.ratings.average.toFixed(1)}</span>
          <StarRating rating={product.ratings.average} count={product.ratings.count} size="md" />
          <span className="text-xs text-primary group-hover:underline">Read reviews</span>
        </a>
      )}

      {/* Price */}
      <PriceDisplay price={product.price} comparePrice={product.comparePrice} size="lg" />

      {/* Stock badge */}
      <div>
        {outOfStock ? (
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Out of Stock
          </span>
        ) : lowStock ? (
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Only {product.stock} left
          </span>
        ) : (
          <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            In Stock
          </span>
        )}
      </div>

      {/* Short description */}
      <p className="text-gray-600 text-sm leading-relaxed">{product.shortDescription}</p>

      {/* Variants */}
      {product.variants.length > 0 && (
        <ProductVariants
          variants={product.variants}
          selected={selected}
          onChange={(name, option) => setSelected((prev) => ({ ...prev, [name]: option }))}
        />
      )}

      {/* Quantity */}
      {!outOfStock && (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Qty:</span>
          <QuantitySelector quantity={quantity} max={product.stock} onChange={setQuantity} />
        </div>
      )}

      {/* Add to Cart + Wishlist */}
      <div className="flex gap-3 items-stretch">
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl border-2 border-primary bg-white text-primary font-semibold text-sm hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
          Add to Cart
        </button>
        <button
          onClick={handleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="flex items-center justify-center w-12 rounded-xl border-2 border-gray-200 bg-white hover:border-red-300 transition-colors"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'
            }`}
          />
        </button>
      </div>

      {/* Buy Now */}
      <button
        onClick={handleBuyNow}
        disabled={outOfStock}
        className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Zap className="w-4 h-4" />
        Buy Now
      </button>

      {/* COD badge */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Shield className="w-4 h-4 text-green-600 shrink-0" />
        <span>Cash on Delivery Available</span>
      </div>

      {/* Delivery + Pincode check */}
      <div className="border border-gray-200 rounded-xl p-4 flex flex-col gap-3 bg-gray-50">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Truck className="w-4 h-4 text-primary shrink-0" />
          <span>Free delivery on orders above ₹999</span>
        </div>
        <div className="flex gap-2">
          <label className="flex items-center gap-1.5 flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 focus-within:border-primary transition-colors">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              inputMode="numeric"
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setPincodeMsg(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && checkPincode()}
              placeholder="Enter pincode"
              className="flex-1 text-sm outline-none bg-transparent placeholder-gray-400"
              maxLength={6}
              aria-label="Pincode"
            />
          </label>
          <button
            onClick={checkPincode}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Check
          </button>
        </div>
        {pincodeMsg && (
          <p className={`text-xs font-medium flex items-center gap-1 ${pincodeMsg.ok ? 'text-green-600' : 'text-red-600'}`}>
            {pincodeMsg.ok && <Check className="w-3.5 h-3.5" />}
            {pincodeMsg.text}
          </p>
        )}
      </div>

      {/* Return policy */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <RotateCcw className="w-4 h-4 shrink-0" />
        <span>Easy 7-day returns</span>
      </div>

      {/* SKU + Share */}
      <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
        <span className="text-xs text-gray-400">SKU: {product.sku}</span>
        <ProductShare product={product} />
      </div>
    </div>
  );
}
