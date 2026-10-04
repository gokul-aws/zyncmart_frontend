import { cn } from '@/lib/utils';

/**
 * Shared table styling for admin lists: the card scrolls horizontally on
 * narrow screens instead of clipping columns.
 */
export function AdminTableCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-surface', className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export const TABLE = 'min-w-full text-left text-sm';
export const THEAD = 'border-b border-border bg-surface-muted/70 text-muted-foreground';
export const TH = 'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide';
export const TBODY = 'divide-y divide-border';
export const TR = 'transition-colors hover:bg-surface-muted/50';
export const TD = 'px-4 py-3 align-middle text-foreground';
