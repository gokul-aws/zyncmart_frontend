'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExternalLink, ChevronLeft, Truck } from 'lucide-react';
import { fetchOrderById, cancelOrder } from '@/lib/api/orders';
import OrderTimeline from '@/components/account/OrderTimeline';
import Badge from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/formatters';

interface Props { id: string }

export default function OrderDetailClient({ id }: Props) {
  const qc = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => fetchOrderById(id),
    enabled: !!id && id !== 'undefined',
  });

  const cancel = useMutation({
    mutationFn: () => cancelOrder(id),
    onSuccess: () => {
      toast.success('Order cancelled');
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      setConfirming(false);
    },
    onError: () => toast.error('Could not cancel order'),
  });

  if (isLoading) return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />;
  if (isError || !order) return <p className="text-sm text-error">Order not found.</p>;

  const canCancel = order.status === 'placed' || order.status === 'confirmed';
  const canTrack = order.status !== 'cancelled' && order.status !== 'returned';

  const handleTrackOrder = () => {
    if (order.tracking?.url) {
      window.open(order.tracking.url, '_blank', 'noopener,noreferrer');
      return;
    }
    document.getElementById('order-tracking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/account/orders" className="text-gray-400 hover:text-gray-700">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
      </div>

      {/* Track Order — full-width on mobile, inline on larger screens */}
      {canTrack && (
        <button
          onClick={handleTrackOrder}
          className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors"
        >
          <Truck className="w-4 h-4" />
          Track Order
        </button>
      )}

      {/* Timeline */}
      <div id="order-tracking" className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Status</h2>
        <OrderTimeline status={order.status} />
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-4">
          Items ({order.items.length})
        </h2>
        <div className="space-y-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-start">
              <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                {item.color && (
                  <p className="flex items-center gap-1.5 text-xs text-gray-500">
                    {item.colorCode && (
                      <span
                        className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: item.colorCode }}
                      />
                    )}
                    {item.color}
                  </p>
                )}
                {item.variant && <p className="text-xs text-gray-500">{item.variant}</p>}
                <p className="text-sm text-gray-600 mt-0.5">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <p className="text-sm font-semibold text-gray-900 shrink-0">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="bg-white border border-gray-100 rounded-xl p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Pricing</h2>
        <div className="space-y-2 text-sm">
          {[
            { label: 'Subtotal', value: order.pricing.subtotal },
            { label: 'Discount', value: -order.pricing.discount },
            { label: 'Shipping', value: order.pricing.shipping },
            { label: 'Tax', value: order.pricing.tax },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-gray-600">
              <span>{label}</span>
              <span className={value < 0 ? 'text-success' : ''}>{value < 0 ? '−' : ''}{formatPrice(Math.abs(value))}</span>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(order.pricing.total)}</span>
          </div>
        </div>
      </div>

      {/* Shipping + Payment */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-2">Shipping Address</h2>
          <div className="text-sm text-gray-600 space-y-0.5">
            <p className="font-medium text-gray-900">{order.shippingAddress.name}</p>
            <p>{order.shippingAddress.line1}</p>
            {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}</p>
            <p>{order.shippingAddress.phone}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-2">Payment</h2>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Method</span>
              <span className="font-medium text-gray-900 capitalize">
                {order.payment.method === 'cod' ? 'Cash on Delivery' : 'Online'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <Badge variant={order.payment.status === 'paid' ? 'success' : order.payment.status === 'failed' ? 'error' : 'outline'}>
                {order.payment.status}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Tracking */}
      {order.tracking && (
        <div className="bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">Track Shipment</p>
            <p className="text-sm text-gray-500">{order.tracking.carrier} · {order.tracking.trackingNumber}</p>
          </div>
          <a
            href={order.tracking.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Track <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Cancel */}
      {canCancel && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="text-sm font-medium text-error hover:underline"
            >
              Cancel this order
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-700">Are you sure you want to cancel?</p>
              <button
                onClick={() => cancel.mutate()}
                disabled={cancel.isPending}
                className="px-3 py-1.5 text-sm font-medium bg-error text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {cancel.isPending ? 'Cancelling…' : 'Yes, Cancel'}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700"
              >
                Keep Order
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
