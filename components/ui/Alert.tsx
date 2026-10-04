import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

const STYLES: Record<AlertVariant, { box: string; icon: typeof Info }> = {
  info: { box: 'border-info/20 bg-info-subtle text-info', icon: Info },
  success: { box: 'border-success/20 bg-success-subtle text-success', icon: CheckCircle2 },
  warning: { box: 'border-warning/25 bg-warning-subtle text-warning', icon: AlertTriangle },
  error: { box: 'border-error/20 bg-error-subtle text-error', icon: XCircle },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: React.ReactNode;
  children?: React.ReactNode;
  /** e.g. a "Retry" button. */
  action?: React.ReactNode;
  /** Announce to screen readers when it appears (errors after an action). */
  live?: boolean;
  className?: string;
}

export default function Alert({ variant = 'info', title, children, action, live = false, className }: AlertProps) {
  const { box, icon: Icon } = STYLES[variant];
  return (
    <div
      role={live ? (variant === 'error' ? 'alert' : 'status') : undefined}
      className={cn('flex gap-3 rounded-xl border p-4 text-sm', box, className)}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-foreground/80">{children}</div>}
      </div>
      {action && <div className="shrink-0 self-center">{action}</div>}
    </div>
  );
}
