'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle2, Package, ShoppingBag } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        {/* Animated checkmark */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-2 mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-900">Order Placed!</h1>
          <p className="text-gray-500">
            Thank you for your purchase. We&apos;ll send you a confirmation shortly.
          </p>
        </motion.div>

        {/* Order details card */}
        {!loading && order && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-2xl shadow-sm p-6 text-left mb-6 space-y-4"
          >
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <p className="text-xs text-gray-500">Order number</p>
                <p className="font-semibold text-gray-900">#{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm text-gray-700">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700 truncate mr-4">
                    {item.name}{' '}
                    <span className="text-gray-400">× {item.quantity}</span>
                  </span>
                  <span className="font-medium text-gray-900 shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatPrice(order.pricing.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>
                  {order.pricing.shipping === 0
                    ? 'Free'
                    : formatPrice(order.pricing.shipping)}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                <span>Total</span>
                <span>{formatPrice(order.pricing.total)}</span>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-3 text-sm text-gray-500">
              <p>
                Payment:{' '}
                <span className="capitalize text-gray-700 font-medium">
                  {order.payment.method === 'cod'
                    ? 'Cash on Delivery'
                    : 'Online (Razorpay)'}
                </span>
              </p>
            </div>
          </motion.div>
        )}

        {!loading && !order && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-sm p-6 mb-6"
          >
            <p className="text-gray-500 text-sm">
              Your order has been placed successfully.
            </p>
          </motion.div>
        )}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {order && (
            <Link
              href={`/account/orders/${order._id}`}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-primary/5 transition-colors"
            >
              <Package className="w-4 h-4" />
              Track Order
            </Link>
          )}
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
