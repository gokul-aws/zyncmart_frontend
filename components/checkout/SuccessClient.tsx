'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Package, ShoppingBag } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import { buttonClasses } from '@/components/ui/Button';
import api from '@/lib/api/axios';
import { GA } from '@/lib/analytics';
import type { Order } from '@/types/order';
import { formatPrice, formatDate } from '@/lib/formatters';

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const firedGA = useRef(false);

  useEffect(() => {
    if (!orderId || orderId === 'undefined') {
      router.replace('/');
      return;
    }
    api
      .get(`/orders/${orderId}`)
      .then((res) => {
        const o = res.data.data as Order;
        setOrder(o);
        if (!firedGA.current) {
          GA.purchase(o);
          firedGA.current = true;
        }
      })
      .catch(() => {
        // show generic success even if fetch fails
      })
      .finally(() => setLoading(false));
  }, [orderId, router]);

  const awaitingPayment = order?.payment.method === 'razorpay' && order.payment.status !== 'paid';
  const heading = !order ? 'Order placed' : awaitingPayment ? 'Order received' : 'Thank you for your order';
  const message = !order
    ? 'Your order has been placed successfully.'
    : order.payment.method === 'cod'
      ? 'Your order is confirmed. Please keep the amount ready for cash on delivery.'
      : awaitingPayment
        ? 'We are confirming your payment with Razorpay. Your order page will update once it is confirmed.'
        : 'Your payment was received and your order is confirmed.';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner label="Loading your order" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
      <div className="text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.25 }} className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-success-subtle">
          {awaitingPayment ? <Clock className="h-8 w-8 text-warning" aria-hidden="true" /> : <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />}
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{heading}</h1>
        <p className="mt-2 text-muted-foreground" role="status">
          {message}
        </p>
      </div>

      {order && (
        <section aria-label="Order details" className="mt-8 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-sm text-muted-foreground">Order number</p>
              <p className="font-semibold text-foreground">#{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="text-sm text-foreground">{formatDate(order.createdAt)}</p>
            </div>
          </div>

          <ul className="space-y-2 py-4 text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-4">
                <span className="min-w-0 truncate text-foreground">
                  {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span className="shrink-0 font-medium tabular-nums text-foreground">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <dl className="space-y-1.5 border-t border-border pt-4 text-sm tabular-nums">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd className="text-foreground">{formatPrice(order.pricing.subtotal)}</dd>
            </div>
            {order.pricing.discount > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount</dt>
                <dd>−{formatPrice(order.pricing.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between text-muted-foreground">
              <dt>Shipping{order.shippingAddress?.state ? ` (${order.shippingAddress.state})` : ''}</dt>
              <dd className="text-foreground">{order.pricing.shipping === 0 ? 'Free' : formatPrice(order.pricing.shipping)}</dd>
            </div>
            {order.pricing.tax > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <dt>Tax</dt>
                <dd className="text-foreground">{formatPrice(order.pricing.tax)}</dd>
              </div>
            )}
            <div className="flex justify-between pt-1 text-base font-bold text-foreground">
              <dt>Total</dt>
              <dd>{formatPrice(order.pricing.total)}</dd>
            </div>
          </dl>

          <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
            Payment: <span className="font-medium text-foreground">{order.payment.method === 'cod' ? 'Cash on delivery' : 'Online (Razorpay)'}</span>
          </p>
        </section>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {order && (
          <Link href={`/account/orders/${order._id}`} className={buttonClasses({ variant: 'outline', size: 'lg' }, 'flex-1')}>
            <Package className="h-4 w-4" aria-hidden="true" />
            View order
          </Link>
        )}
        <Link href="/products" className={buttonClasses({ size: 'lg' }, 'flex-1')}>
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
