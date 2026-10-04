import { cn } from '@/lib/utils';

interface CardProps extends React.ComponentProps<'div'> {
  /** Inner padding; `none` for cards that manage their own (tables, media). */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const PADDING = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-6 sm:p-8' };

/** Plain bordered surface. Elevation comes from the border, not shadows. */
export default function Card({ padding = 'md', className, ...props }: CardProps) {
  return <div className={cn('rounded-xl border border-border bg-surface', PADDING[padding], className)} {...props} />;
}

export function CardHeader({ title, description, action, className }: { title: React.ReactNode; description?: React.ReactNode; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
