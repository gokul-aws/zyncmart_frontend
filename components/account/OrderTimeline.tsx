import { CheckCircle2, Circle, XCircle } from 'lucide-react';
import type { OrderStatus } from '@/types/order';

const STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'placed', label: 'Order Placed', description: 'Your order has been placed' },
  { status: 'confirmed', label: 'Confirmed', description: 'Order confirmed by seller' },
  { status: 'processing', label: 'Processing', description: 'Preparing your items' },
  { status: 'shipped', label: 'Shipped', description: 'Out for delivery' },
  { status: 'delivered', label: 'Delivered', description: 'Package delivered' },
];

const STEP_ORDER: OrderStatus[] = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

interface OrderTimelineProps {
  status: OrderStatus;
}

export default function OrderTimeline({ status }: OrderTimelineProps) {
  const isCancelled = status === 'cancelled' || status === 'returned';
  const currentIndex = STEP_ORDER.indexOf(status);

  return (
    <div className="py-2">
      {isCancelled ? (
        <div className="flex items-center gap-3 text-error">
          <XCircle className="w-6 h-6 shrink-0" />
          <div>
            <p className="font-semibold capitalize">{status}</p>
            <p className="text-sm text-gray-500">This order has been {status}</p>
          </div>
        </div>
      ) : (
        <ol className="relative border-l border-gray-200 ml-3 space-y-6">
          {STEPS.map((step, idx) => {
            const done = currentIndex >= idx;
            const active = currentIndex === idx;

            return (
              <li key={step.status} className="ml-6">
                <span
                  className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full ring-4 ring-white ${
                    done ? 'bg-primary' : 'bg-gray-100'
                  }`}
                >
                  {done ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-300" />
                  )}
                </span>
                <p
                  className={`font-medium text-sm ${
                    done ? 'text-gray-900' : 'text-gray-400'
                  } ${active ? 'text-primary' : ''}`}
                >
                  {step.label}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
