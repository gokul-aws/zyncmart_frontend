'use client';

import { use,useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCcw, Truck, Check, XCircle } from 'lucide-react';
import AdminPageShell from '@/components/admin/AdminPageShell';
import Badge from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { useAdminOrder, useUpdateAdminOrderStatus } from '@/hooks/useAdminOrders';
import { formatDate, formatPrice } from '@/lib/formatters';
import type { OrderStatus, PaymentStatus } from '@/types/order';
import { adminStatusOptions, canAdminCancel, cancellationRefunds } from '@/lib/orderTransitions';

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
  refund_pending: 'warning',
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
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');

  useEffect(() => {
    if (!order) return;
    setSelectedStatus(order.status);
    setCarrier(order.tracking?.carrier ?? '');
    setTrackingNumber(order.tracking?.trackingNumber ?? '');
    setTrackingUrl(order.tracking?.url ?? '');
  }, [order]);

  // Payment status is never set by hand: it changes only through verified
  // payments and refunds. Cancelling a paid online order refunds it.
  const canCancel = order ? canAdminCancel(order) : false;
  const refundsOnCancel = order ? cancellationRefunds(order) : false;

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
        tracking: {
          carrier: carrier || undefined,
          trackingNumber: trackingNumber || undefined,
          url: trackingUrl || undefined,
        },
      },
    });
  };

  // Confirmed through <ConfirmDialog> (replaces window.confirm); same payload.
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const handleCancelOrder = () => {
    if (!order || !canCancel) return;
    setConfirmingCancel(true);
  };
  const confirmCancelOrder = async () => {
    try {
      await updateMutation.mutateAsync({
        id,
        payload: { status: 'cancelled' },
      });
    } finally {
      setConfirmingCancel(false);
    }
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
        <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-[1fr_380px]">
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
                  <Badge variant={PAYMENT_VARIANTS[order.payment.status]}>{order.payment.status.replace('_', ' ')}</Badge>
                  {order.payment.paidAt && <p className="text-sm text-slate-500">Paid on {formatDate(order.payment.paidAt)}</p>}
                  {order.payment.refunds?.map((refund) => (
                    <p key={refund.paymentId} className="text-sm text-slate-500">
                      Refund {formatPrice(refund.amountPaise / 100)} · {refund.status}
                      {refund.reason !== 'cancellation' ? ` · ${refund.reason.replace(/_/g, ' ')}` : ''}
                    </p>
                  ))}
                  {order.payment.reviewRequired && (
                    <p className="text-sm font-semibold text-amber-700">
                      Needs review{order.payment.reviewReason ? `: ${order.payment.reviewReason.replace(/_/g, ' ')}` : ''}
                    </p>
                  )}
                  {order.cancellation && (
                    <p className="text-sm text-slate-500">
                      Cancelled by {order.cancellation.by} ({order.cancellation.reason.replace(/_/g, ' ')})
                    </p>
                  )}
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
                          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-200 text-subtle-foreground dark:bg-slate-800 text-xs">
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
                            {item.sku && <span className="text-subtle-foreground"> · SKU: {item.sku}</span>}
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
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update fulfilment status and tracking. Cancelling a paid order refunds it automatically.</p>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="fld-page-order-status" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Order status</label>
                  <select id="fld-page-order-status"
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value as OrderStatus)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    {adminStatusOptions(order).map((statusOption) => (
                      <option key={statusOption} value={statusOption}>
                        {statusOption}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="fld-page-carrier" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Carrier</label>
                  <input id="fld-page-carrier"
                    value={carrier}
                    onChange={(event) => setCarrier(event.target.value)}
                    placeholder="Carrier name"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="fld-page-tracking-number" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Tracking number</label>
                  <input id="fld-page-tracking-number"
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                    placeholder="Tracking number"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="fld-page-tracking-url" className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-200">Tracking URL</label>
                  <input id="fld-page-tracking-url"
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
                    {refundsOnCancel ? 'Cancel & refund' : 'Cancel order'}
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
      <ConfirmDialog
        open={confirmingCancel}
        title={refundsOnCancel ? 'Cancel and refund this order?' : 'Cancel this order?'}
        description={refundsOnCancel ? 'The customer is refunded in full and reserved stock is released. This cannot be undone.' : 'Reserved stock will be released. This cannot be undone.'}
        confirmLabel={refundsOnCancel ? 'Cancel & refund' : 'Cancel order'}
        cancelLabel="Keep order"
        destructive
        loading={updateMutation.isPending}
        onCancel={() => setConfirmingCancel(false)}
        onConfirm={confirmCancelOrder}
      />
    </AdminPageShell>
  );
}
