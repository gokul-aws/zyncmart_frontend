'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFieldControl } from './Field';

// 16px text on phones prevents iOS zoom-on-focus; 14px from sm up.
const CONTROL =
  'w-full rounded-lg border border-border-strong bg-surface text-base text-foreground sm:text-sm ' +
  'transition-colors duration-150 ' +
  'focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/25 ' +
  'aria-[invalid=true]:border-error aria-[invalid=true]:focus-visible:ring-error/25 ' +
  'disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted-foreground';

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  const a11y = useFieldControl(props);
  return <input {...props} {...a11y} className={cn(CONTROL, 'h-11 px-3.5', className)} />;
}

export function Textarea({ className, rows = 4, ...props }: React.ComponentProps<'textarea'>) {
  const a11y = useFieldControl(props);
  return <textarea rows={rows} {...props} {...a11y} className={cn(CONTROL, 'px-3.5 py-2.5 leading-relaxed', className)} />;
}

/** Native <select> (keyboard/screen-reader/mobile pickers for free), styled. */
export function Select({ className, children, ...props }: React.ComponentProps<'select'>) {
  const a11y = useFieldControl(props);
  return (
    <div className={cn('relative', className)}>
      <select {...props} {...a11y} className={cn(CONTROL, 'h-11 appearance-none pl-3.5 pr-10')}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    </div>
  );
}

interface ChoiceProps extends Omit<React.ComponentProps<'input'>, 'type'> {
  label: React.ReactNode;
  description?: React.ReactNode;
}

function Choice({ type, label, description, className, ...props }: ChoiceProps & { type: 'checkbox' | 'radio' }) {
  return (
    <label className={cn('group inline-flex min-h-11 cursor-pointer items-start gap-3 py-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60', className)}>
      <input
        type={type}
        {...props}
        className={cn('mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-primary disabled:cursor-not-allowed', type === 'checkbox' && 'rounded')}
      />
      <span className="flex flex-col">
        <span className="text-sm text-foreground">{label}</span>
        {description && <span className="text-sm text-muted-foreground">{description}</span>}
      </span>
    </label>
  );
}

export function Checkbox(props: ChoiceProps) {
  return <Choice type="checkbox" {...props} />;
}

export function Radio(props: ChoiceProps) {
  return <Choice type="radio" {...props} />;
}

/** A radio presented as a selectable card (addresses, payment methods). */
export function RadioCard({ children, className, ...props }: Omit<React.ComponentProps<'input'>, 'type'> & { children: React.ReactNode }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer gap-3 rounded-xl border border-border-strong bg-surface p-4 transition-colors duration-150',
        'hover:border-subtle-foreground',
        'has-[:checked]:border-primary has-[:checked]:bg-primary-subtle has-[:checked]:ring-1 has-[:checked]:ring-primary',
        'has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary',
        'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60 has-[:disabled]:hover:border-border-strong',
        className
      )}
    >
      <input type="radio" {...props} className="mt-0.5 h-5 w-5 shrink-0 accent-primary focus-visible:outline-none" />
      <div className="min-w-0 flex-1">{children}</div>
    </label>
  );
}
