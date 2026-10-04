import { cn } from '@/lib/utils';

/** Placeholder block for loading content. Decorative: hidden from assistive tech. */
export default function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-gray-200/70', className)} />;
}
