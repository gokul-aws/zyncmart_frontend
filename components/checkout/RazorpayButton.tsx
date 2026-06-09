'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useRazorpay } from '@/hooks/useRazorpay';
import { formatPrice } from '@/lib/formatters';

interface RazorpayButtonProps {
  orderId: string;
  orderNumber: string;
  amount: number;
  className?: string;
}

export default function RazorpayButton({
  orderId,
  orderNumber,
  amount,
  className = '',
}: RazorpayButtonProps) {
  const { initiatePayment } = useRazorpay();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await initiatePayment(orderId, orderNumber);
    } catch {
      // errors are toasted inside useRazorpay
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 hover:bg-primary-dark transition-colors ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {loading ? 'Processing…' : `Pay ${formatPrice(amount)}`}
    </button>
  );
}
