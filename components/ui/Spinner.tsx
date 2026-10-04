import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Inline loading indicator with an accessible status label. */
export default function Spinner({ label = 'Loading', className }: { label?: string; className?: string }) {
  return (
    <span role="status" className={cn('inline-flex items-center gap-2 text-muted-foreground', className)}>
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
