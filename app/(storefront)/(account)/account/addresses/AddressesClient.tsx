'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, X, MapPin } from 'lucide-react';
import { fetchUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/lib/api/orders';
import AddressCard from '@/components/account/AddressCard';
import EmptyState from '@/components/ui/EmptyState';
import type { Address } from '@/types/user';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid mobile number'),
  line1: z.string().min(3, 'Address required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  pincode: z.string().regex(/^\d{6}$/, '6-digit pincode required'),
});
type FormData = z.infer<typeof schema>;

export default function AddressesClient() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: fetchUserAddresses,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openAdd = () => { setEditing(null); reset({}); setShowForm(true); };
  const openEdit = (addr: Address) => {
    setEditing(addr);
    reset({ name: addr.name, phone: addr.phone, line1: addr.line1, line2: addr.line2 ?? '', city: addr.city, state: addr.state, pincode: addr.pincode });
    setShowForm(true);
  };

  const saveMutation = useMutation({
    mutationFn: (data: FormData) =>
      editing?._id ? updateAddress(editing._id, data) : addAddress(data as Omit<Address, '_id'>),
    onSuccess: () => {
      toast.success(editing ? 'Address updated' : 'Address added');
      qc.invalidateQueries({ queryKey: ['addresses'] });
      setShowForm(false);
    },
    onError: () => toast.error('Could not save address'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => { toast.success('Address deleted'); qc.invalidateQueries({ queryKey: ['addresses'] }); },
    onError: () => toast.error('Could not delete address'),
  });

  const defaultMutation = useMutation({
    mutationFn: setDefaultAddress,
    onSuccess: () => { toast.success('Default address updated'); qc.invalidateQueries({ queryKey: ['addresses'] }); },
    onError: () => toast.error('Could not update default'),
  });

  const FIELDS = [
    { name: 'name', label: 'Full Name', type: 'text', col: 2 },
    { name: 'phone', label: 'Mobile', type: 'tel', col: 1 },
    { name: 'line1', label: 'Address Line 1', type: 'text', col: 2 },
    { name: 'line2', label: 'Address Line 2 (optional)', type: 'text', col: 2 },
    { name: 'city', label: 'City', type: 'text', col: 1 },
    { name: 'state', label: 'State', type: 'text', col: 1 },
    { name: 'pincode', label: 'Pincode', type: 'text', col: 1 },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">My Addresses</h1>
        <button
          onClick={openAdd}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">{editing ? 'Edit Address' : 'New Address'}</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="grid grid-cols-2 gap-4" noValidate>
            {FIELDS.map((f) => (
              <div key={f.name} className={f.col === 2 ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                <input
                  {...register(f.name)}
                  type={f.type}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                {errors[f.name] && <p className="mt-0.5 text-xs text-error">{errors[f.name]?.message}</p>}
              </div>
            ))}
            <div className="col-span-2 flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saveMutation.isPending} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-60">
                {saveMutation.isPending ? 'Saving…' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />}

      {!isLoading && addresses.length === 0 && !showForm && (
        <EmptyState
          title="No addresses saved"
          description="Add an address to speed up checkout."
          icon={<MapPin className="w-12 h-12" />}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {addresses.map((addr) => (
          <AddressCard
            key={addr._id}
            address={addr}
            onEdit={openEdit}
            onDelete={(id) => deleteMutation.mutate(id)}
            onSetDefault={(id) => defaultMutation.mutate(id)}
          />
        ))}
      </div>
    </div>
  );
}
