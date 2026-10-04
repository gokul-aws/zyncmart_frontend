import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
export type ButtonSize = 'sm' | 'md' | 'lg';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap ' +
  'transition-colors duration-150 select-none ' +
  'disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50';

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'bg-ink text-white hover:bg-ink/90',
  outline: 'border border-border-strong bg-surface text-foreground hover:bg-surface-muted',
  ghost: 'text-foreground hover:bg-surface-muted',
  destructive: 'bg-error text-white hover:bg-error/90',
  link: 'text-primary underline-offset-4 hover:underline',
};

// Heights: sm 36px (dense/admin), md 44px (default touch target), lg 48px (primary purchase actions).
const SIZES: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

/** Button styles for non-button elements (e.g. a <Link> that looks like a button). */
export function buttonClasses({ variant = 'primary', size = 'md', fullWidth = false }: ButtonStyleOptions = {}, className?: string) {
  return cn(BASE, VARIANTS[variant], variant === 'link' ? 'h-auto px-0' : SIZES[size], fullWidth && 'w-full', className);
}

export interface ButtonProps extends React.ComponentProps<'button'>, ButtonStyleOptions {
  /** Shows a spinner, disables the button and marks it busy. */
  loading?: boolean;
}

export default function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  disabled,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, fullWidth }, className)}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
