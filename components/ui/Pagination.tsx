import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function pageNumbers(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const inner: number[] = [];
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) inner.push(i);
  return [1, ...(inner[0] > 2 ? ['gap' as const] : []), ...inner, ...(inner[inner.length - 1] < total - 1 ? ['gap' as const] : []), total];
}

const ITEM = 'inline-flex h-11 min-w-11 items-center justify-center rounded-lg px-3 text-sm font-medium tabular-nums transition-colors';

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export default function Pagination({ page, pages, onPageChange, className }: PaginationProps) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-center gap-1', className)}>
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(ITEM, 'text-foreground hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40')}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      {/* Phones: compact "page x of y"; larger screens: page numbers. */}
      <span className="px-2 text-sm text-muted-foreground sm:hidden">
        Page <span className="font-medium text-foreground">{page}</span> of {pages}
      </span>
      <div className="hidden items-center gap-1 sm:flex">
        {pageNumbers(page, pages).map((item, i) =>
          item === 'gap' ? (
            <span key={`gap-${i}`} className="px-1 text-muted-foreground" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              aria-label={`Page ${item}`}
              className={cn(ITEM, item === page ? 'bg-ink text-white' : 'text-foreground hover:bg-surface-muted')}
            >
              {item}
            </button>
          )
        )}
      </div>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        className={cn(ITEM, 'text-foreground hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40')}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </nav>
  );
}
