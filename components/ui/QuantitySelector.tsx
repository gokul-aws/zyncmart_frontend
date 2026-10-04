'use client';

import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantitySelectorProps {
  quantity: number;
  max?: number;
  onChange: (qty: number) => void;
  /** md = 44px touch targets (default); sm = 36px for compact rows. */
  size?: 'sm' | 'md';
  /** Accessible name of the group, e.g. include the product name in lists. */
  label?: string;
  disabled?: boolean;
}

export default function QuantitySelector({ quantity, max = 99, onChange, size = 'md', label = 'Quantity', disabled = false }: QuantitySelectorProps) {
  const btn = cn(
    'flex items-center justify-center text-foreground transition-colors hover:bg-surface-muted',
    'disabled:cursor-not-allowed disabled:opacity-40',
    size === 'md' ? 'h-11 w-11' : 'h-9 w-9'
  );

  return (
    <div role="group" aria-label={label} className="inline-flex items-center overflow-hidden rounded-lg border border-border-strong bg-surface">
      <button type="button" onClick={() => onChange(Math.max(1, quantity - 1))} disabled={disabled || quantity <= 1} aria-label="Decrease quantity" className={btn}>
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span aria-live="polite" className={cn('select-none text-center text-sm font-semibold tabular-nums text-foreground', size === 'md' ? 'w-10' : 'w-8')}>
        {quantity}
      </span>
      <button type="button" onClick={() => onChange(Math.min(max, quantity + 1))} disabled={disabled || quantity >= max} aria-label="Increase quantity" className={btn}>
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
