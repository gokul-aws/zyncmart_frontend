'use client';

import { useState } from 'react';
import { CreditCard, Truck, ChevronLeft, Loader2, ShieldCheck } from 'lucide-react';
import type { Address } from '@/types/user';
import { formatPrice } from '@/lib/formatters';

const COD_LIMIT = 10000;

interface PaymentStepProps {
  shippingAddress: Address;
  total: number;
  onBack: () => void;
  onPlaceOrder: (paymentMethod: 'razorpay' | 'cod') => Promise<void>;
}

export default function PaymentStep({
  shippingAddress,
  total,
  onBack,
  onPlaceOrder,
}: PaymentStepProps) {
  const codAvailable = total < COD_LIMIT;
  const [selectedMethod, setSelectedMethod] = useState<'razorpay' | 'cod'>(
    'razorpay'
  );
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      await onPlaceOrder(selectedMethod);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-primary" />
        Payment
      </h2>

      {/* Delivery address recap */}
      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
        <p className="font-semibold text-gray-900 mb-1">Delivering to</p>
        <p>{shippingAddress.name} · {shippingAddress.phone}</p>
        <p>
          {shippingAddress.line1}
          {shippingAddress.line2 ? `, ${shippingAddress.line2}` : ''},{' '}
          {shippingAddress.city}, {shippingAddress.state} — {shippingAddress.pincode}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-2 text-primary text-xs font-medium hover:underline"
        >
          Change address
        </button>
      </div>

      {/* Payment options */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">Choose payment method</p>

        {/* Razorpay */}
        <label
          className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
            selectedMethod === 'razorpay'
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="razorpay"
            checked={selectedMethod === 'razorpay'}
            onChange={() => setSelectedMethod('razorpay')}
            className="mt-0.5 accent-primary"
          />
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">Pay Online</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Cards, UPI, Net Banking, Wallets, EMI — powered by Razorpay
            </p>
            <div className="flex gap-2 mt-2">
              {['UPI', 'Visa', 'MC', 'Wallet'].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium bg-gray-100 text-gray-600 rounded px-1.5 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </label>

        {/* COD */}
        <label
          className={`flex gap-3 p-4 rounded-xl border-2 transition-colors ${
            codAvailable
              ? 'cursor-pointer ' +
                (selectedMethod === 'cod'
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300')
              : 'opacity-50 cursor-not-allowed border-gray-200'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value="cod"
            checked={selectedMethod === 'cod'}
            onChange={() => codAvailable && setSelectedMethod('cod')}
            disabled={!codAvailable}
            className="mt-0.5 accent-primary"
          />
          <div className="flex items-start gap-2 flex-1">
            <Truck className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-gray-900">Cash on Delivery</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {codAvailable
                  ? 'Pay when your order arrives'
                  : `Not available for orders above ${formatPrice(COD_LIMIT)}`}
              </p>
            </div>
          </div>
        </label>
      </div>

      {/* Trust badge */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
        <span>Your payment information is encrypted and secure.</span>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={placing}
          className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
        >
          {placing && <Loader2 className="w-4 h-4 animate-spin" />}
          {placing
            ? 'Placing order…'
            : selectedMethod === 'cod'
            ? `Place Order · ${formatPrice(total)}`
            : `Pay ${formatPrice(total)}`}
        </button>
      </div>
    </div>
  );
}
