import { cn } from '@/lib/utils';

type IconButtonVariant = 'ghost' | 'outline' | 'overlay' | 'on-dark';

const VARIANTS: Record<IconButtonVariant, string> = {
  ghost: 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
  outline: 'border border-border-strong bg-surface text-foreground hover:bg-surface-muted',
  // On top of product imagery.
  overlay: 'bg-surface/95 text-foreground shadow-sm hover:bg-surface',
  // On the dark ink header/footer.
  'on-dark': 'text-white/80 hover:bg-white/10 hover:text-white',
};

export interface IconButtonProps extends Omit<React.ComponentProps<'button'>, 'aria-label'> {
  /** Accessible name — required because the button shows only an icon. */
  label: string;
  variant?: IconButtonVariant;
  /** md = 44px touch target (default); sm = 36px for dense layouts. */
  size?: 'sm' | 'md';
}

export default function IconButton({ label, variant = 'ghost', size = 'md', className, type = 'button', children, ...props }: IconButtonProps) {
  // cn() does not merge conflicting utilities, so leave out our display class
  // when the caller hides the button (e.g. "hidden md:inline-flex").
  const display = /(^|\s)hidden(\s|$)/.test(className ?? '') ? '' : 'inline-flex';
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        // No position utility: callers add `relative` (badges) or `absolute` (overlays).
        display,
        'shrink-0 items-center justify-center rounded-full transition-colors duration-150',
        'disabled:pointer-events-none disabled:opacity-50',
        size === 'md' ? 'h-11 w-11' : 'h-9 w-9',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
