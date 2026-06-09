'use client';

import { MapPin, Pencil, Trash2, Star } from 'lucide-react';
import type { Address } from '@/types/user';

interface AddressCardProps {
  address: Address;
  onEdit?: (address: Address) => void;
  onDelete?: (id: string) => void;
  onSetDefault?: (id: string) => void;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (address: Address) => void;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  selectable = false,
  selected = false,
  onSelect,
}: AddressCardProps) {
  return (
    <div
      onClick={() => selectable && onSelect?.(address)}
      className={`relative border rounded-xl p-4 transition-all ${
        selectable ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-primary bg-primary-light'
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      {/* Default badge */}
      {address.isDefault && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium text-primary">
          <Star className="w-3 h-3 fill-primary" />
          Default
        </span>
      )}

      {/* Radio for selectable mode */}
      {selectable && (
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 ${
              selected ? 'border-primary bg-primary' : 'border-gray-300'
            } flex items-center justify-center`}
          >
            {selected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
          </div>
          <AddressBody address={address} />
        </div>
      )}

      {!selectable && (
        <>
          <div className="flex items-start gap-2 mb-3">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <AddressBody address={address} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
            {onEdit && (
              <button
                onClick={() => onEdit(address)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
              >
                <Pencil className="w-3 h-3" />
                Edit
              </button>
            )}
            {onSetDefault && !address.isDefault && address._id && (
              <button
                onClick={() => onSetDefault(address._id!)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary transition-colors"
              >
                <Star className="w-3 h-3" />
                Set default
              </button>
            )}
            {onDelete && address._id && (
              <button
                onClick={() => onDelete(address._id!)}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-error transition-colors ml-auto"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function AddressBody({ address }: { address: Address }) {
  return (
    <div className="text-sm">
      <p className="font-semibold text-gray-900">{address.name}</p>
      <p className="text-gray-600">{address.line1}</p>
      {address.line2 && <p className="text-gray-600">{address.line2}</p>}
      <p className="text-gray-600">
        {address.city}, {address.state} – {address.pincode}
      </p>
      <p className="text-gray-500">{address.phone}</p>
    </div>
  );
}
