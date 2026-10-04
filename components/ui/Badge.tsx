import { cn } from '@/lib/utils';

export type BadgeVariant = 'default' | 'neutral' | 'info' | 'success' | 'warning' | 'error' | 'sale' | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

// Tinted backgrounds with text-safe foregrounds (all ≥4.5:1). `sale` is the
// one solid badge, reserved for discounts on product imagery.
const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary-subtle text-primary',
  neutral: 'bg-surface-muted text-muted-foreground',
  info: 'bg-info-subtle text-info',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  error: 'bg-error-subtle text-error',
  sale: 'bg-accent text-accent-foreground',
  outline: 'border border-border-strong bg-surface text-muted-foreground',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
