'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/formatters';
import QuantitySelector from '@/components/ui/QuantitySelector';
import IconButton from '@/components/ui/IconButton';
import type { CartItem as CartItemType } from '@/types/cart';
import { cn } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
  /** Drawer layout: smaller image and controls. */
  compact?: boolean;
  /** Called when a link is followed (e.g. to close the drawer). */
  onNavigate?: () => void;
}

export default function CartItem({ item, compact = false, onNavigate }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const href = `/products/${item.slug ?? item.productId}`;
  const options = [item.attributes?.color, item.attributes?.size].filter(Boolean).join(' · ');

  return (
    <div className="flex gap-3 py-4 sm:gap-4">
      <Link href={href} onClick={onNavigate} className="shrink-0 rounded-lg" tabIndex={-1} aria-hidden="true">
        <div className={cn('relative overflow-hidden rounded-lg bg-surface-muted', compact ? 'h-20 w-20' : 'h-24 w-24 sm:h-28 sm:w-28')}>
          {item.image && <Image src={item.image} alt="" fill sizes={compact ? '80px' : '112px'} className="object-cover" />}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={href} onClick={onNavigate} className="line-clamp-2 text-sm font-medium text-foreground hover:underline">
              {item.name}
            </Link>
            {options && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                {item.attributes?.colorCode && (
                  <span className="h-3 w-3 shrink-0 rounded-full border border-black/15" style={{ backgroundColor: item.attributes.colorCode }} aria-hidden="true" />
                )}
                {options}
              </p>
            )}
          </div>
          <IconButton label={`Remove ${item.name} from cart`} size="sm" onClick={() => removeItem(item._id)} className="-mr-2 -mt-1">
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </IconButton>
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-2 pt-2">
          <QuantitySelector
            quantity={item.quantity}
            max={item.stock?.stock ?? 99}
            onChange={(qty) => updateQuantity(item._id, qty)}
            size="sm"
            label={`Quantity of ${item.name}`}
          />
          <div className="text-right tabular-nums">
            <p className="text-sm font-semibold text-foreground">{formatPrice(item.totalPrice ?? item.price * item.quantity)}</p>
            {item.quantity > 1 && <p className="text-xs text-muted-foreground">{formatPrice(item.price)} each</p>}
            {item.quantity === 1 && item.originalPrice != null && item.originalPrice > item.price && (
              <p className="text-xs text-subtle-foreground line-through">
                <span className="sr-only">MRP </span>
                {formatPrice(item.originalPrice)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
