'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { useBuyNowStore } from '@/lib/store/buyNowStore';
import { formatPrice } from '@/lib/formatters';

export default function OrderSummary() {
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';

  const cartItems = useCartStore((s) => s.items);
  const cartGetSummary = useCartStore((s) => s.getSummary);
  const buyNowItems = useBuyNowStore((s) => s.items);
  const buyNowGetSummary = useBuyNowStore((s) => s.getSummary);

  const items = isBuyNow ? buyNowItems : cartItems;
  const getSummary = isBuyNow ? buyNowGetSummary : cartGetSummary;
  const { subtotal, shipping, total } = getSummary();

  return (
    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 text-lg">Order Summary</h2>

      <ul className="divide-y divide-gray-200">
        {items.map((item) => (
          <li
            key={`${item.productId}-${item.variantId ?? item.variant ?? ''}`}
            className="py-3 flex gap-3 items-start"
          >
            <div className="relative w-14 h-14 shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</p>
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
              <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900 shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
        </div>
        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      {shipping > 0 && (
        <p className="text-xs text-gray-500">
          Add {formatPrice(999 - subtotal)} more for free shipping.
        </p>
      )}
    </div>
  );
}
