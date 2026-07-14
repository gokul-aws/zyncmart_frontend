'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { useCartStore } from '@/lib/store/cartStore';
import { formatPrice } from '@/lib/formatters';
import QuantitySelector from '@/components/ui/QuantitySelector';
import type { CartItem as CartItemType } from '@/types/cart';

interface CartItemProps {
  item: CartItemType;
  compact?: boolean;
}

export default function CartItem({ item, compact = false }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-3 py-3">
      <Link href={`/products/${item.slug}`} className="shrink-0">
        <div className={`relative bg-gray-100 rounded-lg overflow-hidden ${compact ? 'w-16 h-16' : 'w-20 h-20'}`}>
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes={compact ? '64px' : '80px'}
            className="object-cover"
          />
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.slug}`}
          className="text-sm font-medium text-gray-900 hover:text-primary line-clamp-2 transition-colors"
        >
          {item.name}
        </Link>
        {item.color && (
          <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
            {item.colorCode && (
              <span
                className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                style={{ backgroundColor: item.colorCode }}
              />
            )}
            {item.color}
          </p>
        )}
        {item.variant && (
          <p className="text-xs text-gray-500 mt-0.5">{item.variant}</p>
        )}

        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(item.price)}
            </span>
            {item.comparePrice && item.comparePrice > item.price && (
              <span className="ml-1.5 text-xs text-gray-400 line-through">
                {formatPrice(item.comparePrice)}
              </span>
            )}
          </div>

          {compact ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
              <button
                onClick={() => removeItem(item.productId, item.variant, item.variantId)}
                aria-label="Remove item"
                className="p-1 text-gray-400 hover:text-error transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <QuantitySelector
                quantity={item.quantity}
                max={item.stock}
                onChange={(qty) => updateQuantity(item.productId, qty, item.variant, item.variantId)}
              />
              <button
                onClick={() => removeItem(item.productId, item.variant, item.variantId)}
                aria-label="Remove item"
                className="p-1 text-gray-400 hover:text-error transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
