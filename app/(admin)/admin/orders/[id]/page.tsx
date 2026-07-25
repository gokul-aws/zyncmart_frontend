'use client';

import { use,useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCcw, Truck, DollarSign, Check, XCircle } from 'lucide-react';
import AdminPageShell from '@/components/admin/AdminPageShell';
import Badge from '@/components/ui/Badge';
import { useAdminOrder, useUpdateAdminOrderStatus } from '@/hooks/useAdminOrders';
import { formatDate, formatPrice } from '@/lib/formatters';
import type { OrderStatus, PaymentStatus } from '@/types/order';

const STATUS_OPTIONS: OrderStatus[] = [
  'placed',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'returned',
];

const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ['pending', 'paid', 'failed', 'refunded'];

const STATUS_VARIANTS: Record<OrderStatus, 'default' | 'success' | 'error' | 'warning' | 'outline'> = {
  placed: 'warning',
  confirmed: 'default',
  processing: 'warning',
  shipped: 'default',
  delivered: 'success',
  cancelled: 'error',
  returned: 'error',
};

const PAYMENT_VARIANTS: Record<PaymentStatus, 'default' | 'success' | 'error' | 'warning' | 'outline'> = {
  pending: 'warning',
  paid: 'success',
  failed: 'error',
  refunded: 'error',
};

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const { data: order, isLoading, isError, refetch } = useAdminOrder(id);
  const updateMutation = useUpdateAdminOrderStatus();

  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('placed');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<PaymentStatus>('pending');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  useEffect(() => {
    if (!order) return;
    setSelectedStatus(order.status);
    setSelectedPaymentStatus(order.payment.status);
    setCarrier(order.tracking?.carrier ?? '');
    setTrackingNumber(order.tracking?.trackingNumber ?? '');
    setTrackingUrl(order.tracking?.url ?? '');
  }, [order]);

  const canRefund = order?.payment.status === 'paid';
  const canCancel = order ? order.status !== 'cancelled' && order.status !== 'returned' : false;

  const statusLabel = order ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Order';

  const handleRefresh = async () => {
    await refetch();
  };

  const handleStatusUpdate = async () => {
    if (!order) return;
    await updateMutation.mutateAsync({
      id,
      payload: {
        status: selectedStatus,
        paymentStatus: selectedPaymentStatus,
        tracking: {
          carrier: carrier || undefined,
          trackingNumber: trackingNumber || undefined,
          url: trackingUrl || undefined,
        },
      },
    });
  };

  const handleCancelOrder = async () => {
    if (!order || !canCancel) return;
    if (!window.confirm('Cancel this order? This action cannot be undone.')) return;

    await updateMutation.mutateAsync({
      id,
      payload: { status: 'cancelled' },
    });
  };

  const handleRefundOrder = async () => {
    if (!order || !canRefund) return;
    if (!window.confirm('Mark payment as refunded for this order?')) return;

    await updateMutation.mutateAsync({
      id,
      payload: { paymentStatus: 'refunded' },
    });
  };

  const orderTotalItems = order?.items.reduce((count, item) => count + item.quantity, 0) ?? 0;

  return (
    <AdminPageShell
      title={order ? `Order #${order.orderNumber}` : 'Order details'}
      description="View full order details, update status, and manage refunds."
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-100 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to orders
          </Link>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-900"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </button>
        </div>
      }
    >
      {isError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm dark:border-rose-600/40 dark:bg-rose-950/20 dark:text-rose-200">
          <p className="font-semibold">Unable to load order.</p>
          <p className="mt-2 text-sm">Please try again or return to orders overview.</p>
        </div>
      ) : isLoading || !order ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Loading order details…
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Order summary</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Placed on {formatDate(order.createdAt)} · {orderTotalItems} items
                  </p>
                </div>
                <Badge variant={STATUS_VARIANTS[order.status]}>{statusLabel}</Badge>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Customer</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{order.user?.name ?? 'Guest customer'}</p>
                  <p className="text-sm text-slate-500">{order.user?.email ?? 'No email provided'}</p>
                </div>
                <div className="space-y-3 rounded-3xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Payment</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{order.payment.method.toUpperCase()}</p>
                  <Badge variant={PAYMENT_VARIANTS[order.payment.status]}>{order.payment.status}</Badge>
                  {order.payment.paidAt && <p className="text-sm text-slate-500">Paid on {formatDate(order.payment.paidAt)}</p>}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Shipping address</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Where the order will be delivered.</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p>{order.shippingAddress.name}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Order items</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Review products included in the order.</p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(order.pricing.total)}</p>
              </div>

              <div className="mt-6 space-y-4">
                {order.items.map((item, index) => (
                  <div key={`${item.product}-${index}`} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                    <div className="flex gap-4">
                      <div className="relative shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-20 w-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-200 text-slate-400 dark:bg-slate-800 text-xs">
                            No image
                          </div>
                        )}
                        <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-white shadow">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{item.name}</p>
                        {item.color && (
                          <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                            {item.colorCode && (
                              <span
                                className="h-3 w-3 rounded-full border border-black/10 shrink-0"
                                style={{ backgroundColor: item.colorCode }}
                              />
                            )}
                            Color: {item.color}
                            {item.sku && <span className="text-slate-400"> · SKU: {item.sku}</span>}
                          </p>
                        )}
                        {item.variant && <p className="text-sm text-slate-500">Variant: {item.variant}</p>}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <span>{formatPrice(item.price)}</span>
                          <span>Subtotal: {formatPrice(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Status manager</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update order status, track shipments, or refund payments.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Order status</label>
                  <select
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {STATUS_OPTIONS.map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Payment status</label>
                  <select
                    value={selectedPaymentStatus}
                    onChange={(event) => setSelectedPaymentStatus(event.target.value as PaymentStatus)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {PAYMENT_STATUS_OPTIONS.map((paymentOption) => (
                      <option key={paymentOption} value={paymentOption}>
                        {paymentOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Carrier</label>
                  <input
                    value={carrier}
                    onChange={(event) => setCarrier(event.target.value)}
                    placeholder="Carrier name"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Tracking number</label>
                  <input
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                    placeholder="Tracking number"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Tracking URL</label>
                  <input
                    value={trackingUrl}
                    onChange={(event) => setTrackingUrl(event.target.value)}
                    placeholder="https://"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="grid gap-3">
                  <button
                    type="button"
                    onClick={handleStatusUpdate}
                    disabled={updateMutation.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    Save changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelOrder}
                    disabled={!canCancel || updateMutation.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <XCircle className="h-4 w-4" />
                    Cancel order
                  </button>
                  <button
                    type="button"
                    onClick={handleRefundOrder}
                    disabled={!canRefund || updateMutation.isPending}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <DollarSign className="h-4 w-4" />
                    Mark refunded
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Pricing breakdown</p>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.pricing.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>{formatPrice(order.pricing.shipping)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(order.pricing.tax)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span>-{formatPrice(order.pricing.discount)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 pt-3 font-semibold text-slate-900 dark:border-slate-700 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(order.pricing.total)}</span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}
    </AdminPageShell>
  );
}
