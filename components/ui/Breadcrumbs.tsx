import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

/** The last item is the current page. */
export default function Breadcrumbs({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex min-w-0 flex-wrap items-center gap-1.5 text-muted-foreground">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className={cn('flex min-w-0 items-center gap-1.5', last && 'max-w-[60vw] sm:max-w-xs')}>
              {last || !item.href ? (
                <span aria-current={last ? 'page' : undefined} className={cn('truncate', last && 'font-medium text-foreground')}>
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="rounded-sm transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              )}
              {!last && <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
