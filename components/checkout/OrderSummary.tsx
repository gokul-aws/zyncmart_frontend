'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { useBuyNowStore } from '@/lib/store/buyNowStore';
import { formatPrice } from '@/lib/formatters';

interface OrderSummaryProps {
  shippingCharge?: number;
  detectedState?: string;
}

export default function OrderSummary({ shippingCharge, detectedState }: OrderSummaryProps) {
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get('buyNow') === 'true';

  const cartItems = useCartStore((s) => s.items);
  const cartGetSummary = useCartStore((s) => s.getSummary);
  const buyNowItems = useBuyNowStore((s) => s.items);
  const buyNowGetSummary = useBuyNowStore((s) => s.getSummary);

  const items = isBuyNow ? buyNowItems : cartItems;
  const getSummary = isBuyNow ? buyNowGetSummary : cartGetSummary;
  const { subtotal, discount } = getSummary();

  const shipping = shippingCharge ?? 0;
  const total = subtotal - discount + shipping;

  return (
    <div className="bg-gray-50 rounded-xl p-6 space-y-4">
      <h2 className="font-semibold text-gray-900 text-lg">Order Summary</h2>

      <ul className="divide-y divide-gray-200">
        {items.map((item) => (
          <li
            key={item._id}
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
              {item.attributes?.color && (
                <p className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                  {item.attributes.colorCode && (
                    <span
                      className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: item.attributes.colorCode }}
                    />
                  )}
                  {item.attributes.color}
                </p>
              )}
              {item.attributes?.size && (
                <p className="text-xs text-gray-500 mt-0.5">{item.attributes.size}</p>
              )}
              <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-gray-900 shrink-0">
              {formatPrice(item.totalPrice)}
            </p>
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        {shippingCharge !== undefined && (
          <>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{formatPrice(shipping)}</span>
            </div>
            {detectedState && (
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Detected State</span>
                <span>{detectedState}</span>
              </div>
            )}
          </>
        )}
        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-200">
          <span>Grand Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
