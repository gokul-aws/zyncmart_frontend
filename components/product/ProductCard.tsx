'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/types/product';
import { useCartStore } from '@/lib/store/cartStore';
import { summarizeProduct } from '@/lib/productDisplay';
import { getApiError } from '@/lib/api/orders';
import StarRating from '@/components/ui/StarRating';
import PriceDisplay from '@/components/ui/PriceDisplay';
import WishlistButton from '@/components/ui/WishlistButton';
import Badge from '@/components/ui/Badge';
import Button, { buttonClasses } from '@/components/ui/Button';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

const MAX_SWATCHES = 5;

/**
 * One link (the product name, stretched over the card) plus sibling
 * controls layered above it — no interactive element is nested in a link.
 */
export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleDrawer = useCartStore((state) => state.toggleDrawer);
  const [adding, setAdding] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const summary = summarizeProduct(product);
  const href = `/products/${product.slug}`;
  const image = previewImage ?? summary.image;
  const visibleSwatches = summary.swatches.slice(0, MAX_SWATCHES);
  const extraSwatches = summary.swatches.length - visibleSwatches.length;

  // One badge, most important first.
  const badge = !summary.inStock
    ? { label: 'Out of stock', variant: 'neutral' as const }
    : summary.comparePrice
      ? { label: 'Sale', variant: 'sale' as const } // the exact saving is shown with the price
      : summary.lowStockLabel
        ? { label: summary.lowStockLabel, variant: 'warning' as const }
        : null;

  const handleAddToCart = async () => {
    if (!summary.inStock || summary.needsOptions) return;
    setAdding(true);
    try {
      await addItem(product._id, 1, summary.defaultVariantId);
      toggleDrawer();
      toast.success('Added to cart', { description: product.name });
    } catch (err) {
      toast.error(getApiError(err, 'Could not add to cart. Please try again.').message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-muted">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">No image</div>
        )}

        {badge && (
          <Badge variant={badge.variant} className="absolute left-2 top-2">
            {badge.label}
          </Badge>
        )}

        <div className="absolute right-2 top-2 z-10">
          <WishlistButton productId={product._id} productName={product.name} />
        </div>
      </div>

      <div className="flex flex-1 flex-col pt-3">
        <p className="text-xs font-medium text-muted-foreground">{product.category?.name}</p>
        <h3 className="mt-0.5 line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {/* The stretched link: its ::after covers the whole card. */}
          <Link href={href} className="rounded-sm after:absolute after:inset-0 after:content-[''] hover:underline hover:underline-offset-2">
            {product.name}
          </Link>
        </h3>

        {product.ratings?.count > 0 && (
          <StarRating rating={product.ratings.average} count={product.ratings.count} showValue className="mt-1.5" />
        )}

        <PriceDisplay
          price={summary.price}
          comparePrice={summary.comparePrice}
          prefix={summary.hasPriceRange ? 'From' : undefined}
          size="sm"
          className="mt-1.5"
        />

        {visibleSwatches.length > 0 && (
          <div className="mt-2 flex items-center gap-1.5">
            {visibleSwatches.map((swatch) => (
              <span
                key={swatch.name}
                title={swatch.name}
                aria-hidden="true"
                // Hover preview of that colour's image (desktop enhancement only).
                onMouseEnter={() => swatch.image && setPreviewImage(swatch.image)}
                onMouseLeave={() => setPreviewImage(null)}
                className="relative z-10 h-4 w-4 rounded-full border border-black/15"
                style={{ backgroundColor: swatch.code || '#e7e5e4' }}
              />
            ))}
            {extraSwatches > 0 && <span className="text-xs text-muted-foreground" aria-hidden="true">+{extraSwatches}</span>}
            <span className="sr-only">
              Available in {summary.swatches.length} colour{summary.swatches.length === 1 ? '' : 's'}
            </span>
          </div>
        )}

        <div className="relative z-10 mt-auto pt-3">
          {!summary.inStock ? (
            <Button variant="outline" fullWidth disabled>
              Out of stock
            </Button>
          ) : summary.needsOptions ? (
            <Link href={href} className={buttonClasses({ variant: 'outline', fullWidth: true })} aria-label={`Choose options for ${product.name}`}>
              Choose options
            </Link>
          ) : (
            <Button
              variant="outline"
              fullWidth
              loading={adding}
              onClick={handleAddToCart}
              aria-label={`Add ${product.name} to cart`}
            >
              {!adding && <ShoppingBag className="h-4 w-4" aria-hidden="true" />}
              Add to cart
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
