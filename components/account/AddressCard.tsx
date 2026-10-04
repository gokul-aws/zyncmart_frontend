'use client';

import { Pencil, Trash2, Star } from 'lucide-react';
import type { Address } from '@/types/user';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (address: Address) => void;
}

const ACTION = 'inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground';

export default function AddressCard({ address, onEdit, onDelete, onSetDefault, selectable = false, selected = false, onSelect }: AddressCardProps) {
  const body = (
    <div className="text-sm text-muted-foreground">
      <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
        {address.name}
        {address.isDefault && <Badge variant="neutral">Default</Badge>}
      </p>
      <p className="mt-1">{address.line1}</p>
      {address.line2 && <p>{address.line2}</p>}
      <p>
        {address.city}, {address.state} – {address.pincode}
      </p>
      <p>{address.phone}</p>
    </div>
  );

  if (selectable) {
    return (
      <button
        type="button"
        onClick={() => onSelect?.(address)}
        aria-pressed={selected}
        className={cn('w-full rounded-xl border bg-surface p-4 text-left transition-colors', selected ? 'border-primary bg-primary-subtle ring-1 ring-primary' : 'border-border-strong hover:border-subtle-foreground')}
      >
        {body}
      </button>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-surface p-4">
      {body}
      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-border pt-2">
        {onEdit && (
          <button type="button" onClick={() => onEdit(address)} className={ACTION}>
            <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
            Edit
          </button>
        )}
        {onSetDefault && !address.isDefault && address._id && (
          <button type="button" onClick={() => onSetDefault(address._id!)} className={ACTION}>
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            Set as default
          </button>
        )}
        {onDelete && address._id && (
          <button type="button" onClick={() => onDelete(address._id!)} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-error transition-colors hover:bg-error-subtle">
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Delete
          </button>
        )}
      </div>
    </div>
  );
}
