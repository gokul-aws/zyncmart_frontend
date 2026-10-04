'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Banknote, RotateCcw, ShoppingBag, Truck, Zap } from 'lucide-react';
import StarRating from '@/components/ui/StarRating';
import PriceDisplay from '@/components/ui/PriceDisplay';
import QuantitySelector from '@/components/ui/QuantitySelector';
import WishlistButton from '@/components/ui/WishlistButton';
import Button from '@/components/ui/Button';
import ProductVariants from './ProductVariants';
import ProductColorSelector from './ProductColorSelector';
import ProductShare from './ProductShare';
import { useCartStore } from '@/lib/store/cartStore';
import { GA } from '@/lib/analytics';
import { getApiError } from '@/lib/api/orders';
import { formatPrice } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import type { Product, ColorVariant } from '@/types/product';

/** Opens the Reviews tab (ProductTabs listens for this). */
export const SHOW_REVIEWS_EVENT = 'zyncmart:show-reviews';

interface ProductInfoProps {
  product: Product;
  selectedColorVariant?: ColorVariant | null;
  onColorChange?: (variant: ColorVariant) => void;
}

export default function ProductInfo({
  product,
  selectedColorVariant = null,
  onColorChange,
}: ProductInfoProps) {
  const router = useRouter();
  const { addItem, toggleDrawer } = useCartStore();

  // Resolved from the selected color variant, falling back to the product's
  // own fields for legacy products with no color variants.
  // For variable products, use the first variant's price as default
  const isVariable = product.productType === 'variable';
  const defaultVariantPrice = isVariable && product.variants?.length
    ? product.variants[0].price
    : product.price;
  const activePrice = selectedColorVariant?.price ?? defaultVariantPrice;
  const activeStock = selectedColorVariant ? selectedColorVariant.stock : product.stock;
  const activeSku = selectedColorVariant?.sku ?? (isVariable && product.variants?.length ? product.variants[0].sku : product.sku);
  const activeOriginalPrice = selectedColorVariant
    ? selectedColorVariant.originalPrice
    : (isVariable && product.variants?.length ? product.variants[0].originalPrice : product.originalPrice ?? product.comparePrice);

  // Variable products: the selection is always ONE exact variant (colour +
  // size). The colour and size pickers are two views of that single choice,
  // so the variant added to the cart is exactly the one the customer sees.
  const usesExactVariants = isVariable && !product.colorVariants?.length && (product.variants?.length ?? 0) > 0;
  const variantEntries = useMemo<ColorVariant[]>(
    () => (usesExactVariants ? product.variants ?? [] : [])
      .filter((v) => v.color?.name)
      .map((v) => ({
        _id: v._id,
        color: v.color.name,
        colorCode: v.color.code,
        size: v.size,
        images: v.image ? [{ url: v.image, publicId: '', isPrimary: true }] : [],
        stock: v.stock,
        sku: v.sku,
        price: v.price,
        originalPrice: v.originalPrice,
      })),
    [usesExactVariants, product.variants]
  );
  const selectedColor = selectedColorVariant?.color ?? null;
  const selectedSize = selectedColorVariant?.size ?? null;

  // One swatch per colour. Picking a colour keeps the chosen size when that
  // colour has it in stock, otherwise the first in-stock size of that colour.
  const colorOptions = useMemo<ColorVariant[]>(() => {
    const byColor = new Map<string, ColorVariant[]>();
    for (const v of variantEntries) byColor.set(v.color, [...(byColor.get(v.color) ?? []), v]);
    return [...byColor.entries()].map(([color, list]) => {
      const target =
        (color === selectedColor ? list.find((v) => v._id === selectedColorVariant?._id) : undefined) ??
        list.find((v) => v.size === selectedSize && v.stock > 0) ??
        list.find((v) => v.stock > 0) ??
        list[0];
      // `stock` is the colour's total, so the swatch only reads "out of stock"
      // when no size of that colour is available.
      return { ...target, stock: list.reduce((sum, v) => sum + v.stock, 0) };
    });
  }, [variantEntries, selectedColor, selectedSize, selectedColorVariant]);

  const sizeOptions = variantEntries.filter((v) => v.color === selectedColor && v.size);
  const showSizePicker = new Set(variantEntries.map((v) => v.size).filter(Boolean)).size > 1;
  const variantMissing = isVariable && (product.variants?.length ?? 0) > 0 && !selectedColorVariant;

  // Quantity belongs to the selected option: switching colour/size starts
  // again at 1, so a stale quantity can never exceed the new option's stock.
  const selectionKey = selectedColorVariant?._id ?? 'product';
  const [quantityState, setQuantityState] = useState({ key: selectionKey, value: 1 });
  const quantity = quantityState.key === selectionKey ? quantityState.value : 1;
  const setQuantity = (value: number) => setQuantityState({ key: selectionKey, value });

  // Fire view_item GA4 event once on mount
  useEffect(() => {
    GA.viewItem(product);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product._id]);

  const outOfStock = activeStock === 0;
  const lowStock = !outOfStock && activeStock <= product.lowStockThreshold;
  const cannotBuy = outOfStock || variantMissing;

  const handleAddToCart = async () => {
    if (variantMissing) {
      toast.error('Please select a colour and size');
      return;
    }
    if (outOfStock) return;
    try {
      await addItem(product._id, quantity, selectedColorVariant?._id);
      toggleDrawer();
      toast.success('Added to cart', { description: product.name });
      GA.addToCart(product, quantity);
    } catch (err) {
      toast.error(getApiError(err, 'Failed to add to cart. Please try again.').message);
    }
  };

  const handleBuyNow = async () => {
    if (variantMissing) {
      toast.error('Please select a colour and size');
      return;
    }
    if (outOfStock) return;
    try {
      await addItem(product._id, quantity, selectedColorVariant?._id);
      router.push('/checkout');
    } catch (err) {
      toast.error(getApiError(err, 'Failed to add to cart. Please try again.').message);
    }
  };

  // Mobile sticky purchase bar: shown once the main buttons scroll out of view.
  const actionsRef = useRef<HTMLDivElement>(null);
  const [actionsVisible, setActionsVisible] = useState(true);
  useEffect(() => {
    const el = actionsRef.current;
    if (!el) return;
    // Scroll listener rather than IntersectionObserver: a jump past the buttons
    // (anchor link, restored scroll) never "crosses" the viewport edge.
    const update = () => setActionsVisible(el.getBoundingClientRect().bottom > 0);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground hover:underline">
            {product.category.name}
          </Link>
          {product.brand && (
            <>
              <span aria-hidden="true">·</span>
              <span>{product.brand}</span>
            </>
          )}
        </div>

        <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">{product.name}</h1>

        {product.ratings && product.ratings.count > 0 && (
          <a
            href="#product-details"
            onClick={() => window.dispatchEvent(new Event(SHOW_REVIEWS_EVENT))}
            className="mt-3 inline-flex items-center gap-2 rounded-sm text-sm"
          >
            <StarRating rating={product.ratings.average} showValue />
            <span className="text-primary hover:underline">
              {product.ratings.count} review{product.ratings.count === 1 ? '' : 's'}
            </span>
          </a>
        )}
      </div>

      <div>
        <PriceDisplay price={activePrice} comparePrice={activeOriginalPrice} size="lg" />
        <p className="mt-1 text-sm text-muted-foreground">Inclusive of all taxes</p>
        <p className={cn('mt-3 flex items-center gap-2 text-sm font-medium', outOfStock ? 'text-error' : lowStock ? 'text-warning' : 'text-success')}>
          <span className={cn('h-2 w-2 rounded-full', outOfStock ? 'bg-error' : lowStock ? 'bg-warning' : 'bg-success')} aria-hidden="true" />
          {outOfStock ? 'Out of stock' : lowStock ? `Only ${activeStock} left` : 'In stock'}
        </p>
      </div>

      {product.shortDescription && <p className="text-base leading-relaxed text-muted-foreground">{product.shortDescription}</p>}

      {/* Colour: legacy colorVariants, or one swatch per colour of the exact variants */}
      {((product.colorVariants?.length ?? 0) > 0 || colorOptions.length > 0) && onColorChange && (
        <ProductColorSelector
          colorVariants={product.colorVariants?.length ? product.colorVariants : colorOptions}
          selected={selectedColorVariant}
          onChange={onColorChange}
        />
      )}

      {/* Size: the sizes of the selected colour; out-of-stock sizes are disabled */}
      {showSizePicker && sizeOptions.length > 0 && onColorChange && (
        <ProductVariants
          variants={[{ name: 'Size', options: sizeOptions.map((v) => v.size as string) }]}
          selected={{ Size: selectedSize ?? '' }}
          unavailable={{ Size: sizeOptions.filter((v) => v.stock < 1).map((v) => v.size as string) }}
          onChange={(_name, size) => {
            const exact = sizeOptions.find((v) => v.size === size);
            if (exact) onColorChange(exact);
          }}
        />
      )}

      {!outOfStock && (
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground" id="quantity-label">
            Quantity
          </span>
          <QuantitySelector quantity={quantity} max={activeStock} onChange={setQuantity} label="Quantity" />
        </div>
      )}

      <div ref={actionsRef} className="flex flex-col gap-3">
        <div className="flex gap-3">
          <Button size="lg" onClick={handleAddToCart} disabled={cannotBuy} className="flex-1">
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {outOfStock ? 'Out of stock' : 'Add to cart'}
          </Button>
          <WishlistButton productId={product._id} variant="outline" />
        </div>
        <Button size="lg" variant="outline" onClick={handleBuyNow} disabled={cannotBuy} fullWidth>
          <Zap className="h-5 w-5" aria-hidden="true" />
          Buy now
        </Button>
      </div>

      {/* Delivery & returns — each line matches implemented policy (see components/home/TrustStrip). */}
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface text-sm">
        <li className="flex items-center gap-3 px-4 py-3">
          <Truck className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>Free shipping on orders from {formatPrice(999)}</span>
        </li>
        <li className="flex items-center gap-3 px-4 py-3">
          <Banknote className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>Cash on delivery on orders up to {formatPrice(10000)}</span>
        </li>
        <li className="flex items-center gap-3 px-4 py-3">
          <RotateCcw className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span>
            7-day returns on eligible items ·{' '}
            <Link href="/policies/returns" className="text-primary hover:underline">
              Returns policy
            </Link>
          </span>
        </li>
      </ul>

      <div className="flex flex-col gap-3 border-t border-border pt-5">
        {activeSku && <p className="text-sm text-muted-foreground">SKU: {activeSku}</p>}
        <ProductShare product={product} />
      </div>

      {/* Mobile sticky bar, above the bottom navigation. */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur transition-transform duration-200 md:hidden',
          actionsVisible ? 'pointer-events-none translate-y-[200%]' : 'translate-y-0'
        )}
        aria-hidden={actionsVisible}
        inert={actionsVisible}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-muted-foreground">{product.name}</p>
            <p className="text-base font-bold tabular-nums text-foreground">{formatPrice(activePrice)}</p>
          </div>
          {/* Stays enabled without a selection: handleAddToCart asks for colour/size. */}
          <Button onClick={handleAddToCart} disabled={outOfStock} className="shrink-0">
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {outOfStock ? 'Out of stock' : variantMissing ? 'Select options' : 'Add to cart'}
          </Button>
        </div>
      </div>
    </div>
  );
}
