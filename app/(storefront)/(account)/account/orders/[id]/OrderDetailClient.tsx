'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ExternalLink, ChevronLeft, Truck, CreditCard, Package } from 'lucide-react';
import { fetchOrderById, cancelOrder, getApiError } from '@/lib/api/orders';
import { useRazorpay } from '@/hooks/useRazorpay';
import OrderTimeline from '@/components/account/OrderTimeline';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import Card, { CardHeader } from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/Dialog';
import { formatPrice, formatDate } from '@/lib/formatters';

interface Props { id: string }

export default function OrderDetailClient({ id }: Props) {
  const qc = useQueryClient();
  const [confirming, setConfirming] = useState(false);
  const [paying, setPaying] = useState(false);
  const { initiatePayment } = useRazorpay();

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
    onError: (err) => {
      toast.error(getApiError(err, 'Could not cancel order').message);
      qc.invalidateQueries({ queryKey: ['order', id] });
    },
  });

  if (isLoading) return <Skeleton className="h-96 rounded-xl" />;
  if (isError || !order) {
    return (
      <EmptyState compact title="Order not found" description="It may have been removed, or the link is incorrect." action={{ label: 'Back to my orders', href: '/account/orders' }} icon={<Package />} />
    );
  }

  const canCancel = order.status === 'placed' || order.status === 'confirmed';
  const canTrack = order.status !== 'cancelled' && order.status !== 'returned';

  // Unpaid online order still holding its reserved stock: the customer may pay
  // until the window closes (the server refuses it after that).
  const awaitingPayment = order.payment.method === 'razorpay' && order.status === 'placed' && order.payment.status === 'pending';
  const expiresAt = order.reservation?.expiresAt ? new Date(order.reservation.expiresAt) : null;
  const refundPending = order.payment.status === 'refund_pending';
  const refunded = order.payment.status === 'refunded';
  const expired = order.status === 'cancelled' && order.cancellation?.reason === 'payment_timeout';
  const refundedAmount = (order.payment.refunds ?? [])
    .filter((r) => r.status !== 'failed')
    .reduce((sum, r) => sum + r.amountPaise, 0) / 100;
  const isPaid = order.payment.status === 'paid';

  const handleCompletePayment = async () => {
    setPaying(true);
    try {
      // Reuses this order and its reservation; the cart is left untouched.
      await initiatePayment(order._id, order.orderNumber, () => {}, order.shippingAddress.phone);
    } catch {
      // outcome is toasted inside initiatePayment
    } finally {
      setPaying(false);
      qc.invalidateQueries({ queryKey: ['order', id] });
      qc.invalidateQueries({ queryKey: ['orders'] });
    }
  };

  const handleTrackOrder = () => {
    if (order.tracking?.url) {
      window.open(order.tracking.url, '_blank', 'noopener,noreferrer');
      return;
    }
    document.getElementById('order-tracking')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const paymentVariant = order.payment.status === 'paid' ? 'success' : order.payment.status === 'failed' ? 'error' : order.payment.status === 'refund_pending' ? 'warning' : 'neutral';

  return (
    <div className="space-y-5">
      <div>
        <Link href="/account/orders" className="inline-flex h-9 items-center gap-1 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          My orders
        </Link>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">Order #{order.orderNumber}</h1>
        <p className="text-sm text-muted-foreground">Placed on {formatDate(order.createdAt)}</p>
      </div>

      {awaitingPayment && (
        <Alert
          variant="warning"
          title="Payment pending"
          action={
            <Button onClick={handleCompletePayment} loading={paying}>
              {!paying && <CreditCard className="h-4 w-4" aria-hidden="true" />}
              {paying ? 'Opening payment…' : `Pay ${formatPrice(order.pricing.total)}`}
            </Button>
          }
        >
          Your items are reserved
          {expiresAt ? ` until ${expiresAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}` : ''}. Complete the payment before then, or the order will be cancelled automatically.
        </Alert>
      )}

      {expired && !refundPending && !refunded && (
        <Alert variant="info" title="Order expired">
          Payment was not completed within 30 minutes, so this order was cancelled and the items were released. No money was taken.
        </Alert>
      )}

      {(refundPending || refunded) && (
        <Alert variant={refunded ? 'success' : 'info'} title={refunded ? 'Refunded' : 'Refund in progress'}>
          {refunded
            ? `${formatPrice(refundedAmount || order.pricing.total)} has been refunded to your original payment method.`
            : `A refund of ${formatPrice(refundedAmount || order.pricing.total)} has been initiated to your original payment method. It usually arrives within 5–7 business days.`}
        </Alert>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <Card id="order-tracking">
            <CardHeader
              title="Status"
              action={
                canTrack ? (
                  <Button variant="outline" size="sm" onClick={handleTrackOrder}>
                    <Truck className="h-4 w-4" aria-hidden="true" />
                    Track order
                  </Button>
                ) : undefined
              }
            />
            <OrderTimeline status={order.status} />
            {order.tracking && (
              <div className="mt-4 flex items-center justify-between gap-4 border-t border-border pt-4 text-sm">
                <p className="text-muted-foreground">
                  {order.tracking.carrier} · <span className="text-foreground">{order.tracking.trackingNumber}</span>
                </p>
                {order.tracking.url && (
                  <a href={order.tracking.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:underline">
                    Track shipment <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader title={`Items (${order.items.length})`} />
            <ul className="divide-y divide-border">
              {order.items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
                    {item.image && <Image src={item.image} alt="" fill sizes="64px" className="object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    {item.color && (
                      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        {item.colorCode && <span className="h-3 w-3 shrink-0 rounded-full border border-black/15" style={{ backgroundColor: item.colorCode }} aria-hidden="true" />}
                        {item.color}
                      </p>
                    )}
                    {item.variant && <p className="text-sm text-muted-foreground">{item.variant}</p>}
                    <p className="mt-0.5 text-sm tabular-nums text-muted-foreground">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{formatPrice(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader title="Payment" />
            <dl className="space-y-2 text-sm tabular-nums">
              {[
                { label: 'Subtotal', value: order.pricing.subtotal },
                { label: 'Discount', value: -order.pricing.discount },
                { label: 'Shipping', value: order.pricing.shipping },
                { label: 'Tax', value: order.pricing.tax },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-muted-foreground">
                  <dt>{label}</dt>
                  <dd className={value < 0 ? 'text-success' : 'text-foreground'}>
                    {value < 0 ? '−' : ''}
                    {formatPrice(Math.abs(value))}
                  </dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
                <dt>Total</dt>
                <dd>{formatPrice(order.pricing.total)}</dd>
              </div>
              <div className="flex justify-between pt-2 text-muted-foreground">
                <dt>Method</dt>
                <dd className="font-medium text-foreground">{order.payment.method === 'cod' ? 'Cash on delivery' : 'Online'}</dd>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <dt>Status</dt>
                <dd>
                  <Badge variant={paymentVariant}>{order.payment.status.replace('_', ' ')}</Badge>
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Delivery address" />
            <address className="space-y-0.5 text-sm not-italic text-muted-foreground">
              <p className="font-medium text-foreground">{order.shippingAddress.name}</p>
              <p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
              </p>
              <p>{order.shippingAddress.phone}</p>
            </address>
          </Card>

          {canCancel && (
            <button type="button" onClick={() => setConfirming(true)} className="h-10 text-sm font-semibold text-error hover:underline">
              Cancel this order
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Cancel this order?"
        description={isPaid && order.payment.method === 'razorpay' ? 'Your payment will be refunded in full to your original payment method.' : 'The order will be cancelled and the items released.'}
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
        destructive
        loading={cancel.isPending}
        onConfirm={() => cancel.mutate()}
        onCancel={() => setConfirming(false)}
      />
    </div>
  );
}
