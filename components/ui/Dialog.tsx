'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import IconButton from './IconButton';
import Button from './Button';

type DialogSide = 'center' | 'right' | 'left' | 'bottom';

const PANEL: Record<DialogSide, string> = {
  center: 'm-auto w-[calc(100%-2rem)] max-w-md rounded-3xl',
  right: 'my-0 ml-auto mr-0 h-dvh max-h-dvh w-full max-w-sm',
  left: 'my-0 ml-0 mr-auto h-dvh max-h-dvh w-full max-w-sm',
  bottom: 'mx-0 mb-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-3xl',
};

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  /** Sticky footer (actions). */
  footer?: React.ReactNode;
  /** center = modal dialog; right/left/bottom = sheet. */
  side?: DialogSide;
  /** Width of a centered dialog. */
  size?: 'sm' | 'md' | 'lg';
  /** Render only `children` (no header/padding); `title` stays the accessible name. */
  bare?: boolean;
  className?: string;
}

/**
 * Modal dialog / sheet on the native <dialog> element: the rest of the page
 * becomes inert (focus stays inside), Esc closes, focus returns to the
 * trigger on close, and the page behind does not scroll.
 */
export default function Dialog({ open, onClose, title, description, children, footer, side = 'center', size = 'md', bare = false, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
        if (dialog.open) dialog.close();
        // Return focus to whatever opened the dialog (if it is still on the page).
        if (opener?.isConnected) opener.focus();
      };
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      data-side={side}
      aria-labelledby={bare ? undefined : titleId}
      aria-label={bare && typeof title === 'string' ? title : undefined}
      aria-describedby={description && !bare ? descriptionId : undefined}
      onCancel={(e) => {
        // Esc: let React state drive closing.
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // A click on the ::backdrop targets the <dialog> itself.
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        'max-h-[calc(100dvh-2rem)] overflow-hidden border-0 bg-surface p-0 text-foreground shadow-xl',
        PANEL[side],
        side === 'center' && size === 'sm' && 'max-w-sm',
        side === 'center' && size === 'lg' && 'max-w-2xl',
        className
      )}
    >
      {open && bare && children}
      {open && !bare && (
        <div className={cn('flex max-h-[inherit] flex-col', side !== 'center' && side !== 'bottom' && 'h-full')}>
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div className="min-w-0">
              <h2 id={titleId} className="text-lg font-semibold text-foreground">
                {title}
              </h2>
              {description && (
                <p id={descriptionId} className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            <IconButton label="Close" size="sm" onClick={onClose} className="-mr-2 -mt-1">
              <X className="h-5 w-5" aria-hidden="true" />
            </IconButton>
          </div>
          {children && <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>}
          {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  title: React.ReactNode;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Replacement for window.confirm(): accessible, styled, non-blocking. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={description}
      size="sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? 'destructive' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      }
    />
  );
}
