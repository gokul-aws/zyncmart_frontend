import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonClasses } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; href: string };
  icon?: React.ReactNode;
  /** Compact version for panels and drawers. */
  compact?: boolean;
  className?: string;
}

export default function EmptyState({ title, description, action, icon, compact = false, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-4 text-center', compact ? 'py-10' : 'py-20', className)}>
      {icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted text-muted-foreground [&_svg]:h-8 [&_svg]:w-8" aria-hidden="true">
          {icon}
        </div>
      )}
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && (
        <Link href={action.href} className={buttonClasses({ variant: 'primary' }, 'mt-6')}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
