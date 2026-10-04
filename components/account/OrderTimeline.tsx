import { Check, XCircle } from 'lucide-react';
import type { OrderStatus } from '@/types/order';
import { cn } from '@/lib/utils';

const STEPS: { status: OrderStatus; label: string; description: string }[] = [
  { status: 'placed', label: 'Order placed', description: 'We have received your order' },
  { status: 'confirmed', label: 'Confirmed', description: 'Your order is confirmed' },
  { status: 'processing', label: 'Processing', description: 'Preparing your items' },
  { status: 'shipped', label: 'Shipped', description: 'On its way to you' },
  { status: 'delivered', label: 'Delivered', description: 'Package delivered' },
];

const STEP_ORDER: OrderStatus[] = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderTimeline({ status }: { status: OrderStatus }) {
  const isClosed = status === 'cancelled' || status === 'returned';
  const currentIndex = STEP_ORDER.indexOf(status);

  if (isClosed) {
    return (
      <div className="flex items-center gap-3">
        <XCircle className="h-6 w-6 shrink-0 text-muted-foreground" aria-hidden="true" />
        <div>
          <p className="font-semibold capitalize text-foreground">{status}</p>
          <p className="text-sm text-muted-foreground">This order has been {status}.</p>
        </div>
      </div>
    );
  }

  return (
    <ol className="space-y-0">
      {STEPS.map((step, idx) => {
        const done = currentIndex >= idx;
        const current = currentIndex === idx;
        const last = idx === STEPS.length - 1;
        return (
          <li key={step.status} className="relative flex gap-3 pb-5 last:pb-0" aria-current={current ? 'step' : undefined}>
            {!last && <span className={cn('absolute left-3 top-6 h-[calc(100%-1.5rem)] w-px', currentIndex > idx ? 'bg-success' : 'bg-border-strong')} aria-hidden="true" />}
            <span className={cn('relative flex h-6 w-6 shrink-0 items-center justify-center rounded-full', done ? 'bg-success text-white' : 'border-2 border-border-strong bg-surface')}>
              {done && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            </span>
            <div className="-mt-0.5">
              <p className={cn('text-sm font-medium', done ? 'text-foreground' : 'text-muted-foreground')}>
                {step.label}
                {done && !current && <span className="sr-only"> (completed)</span>}
                {current && <span className="sr-only"> (current)</span>}
              </p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
