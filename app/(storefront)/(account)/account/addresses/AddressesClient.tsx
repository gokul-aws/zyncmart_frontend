'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Plus, MapPin } from 'lucide-react';
import { fetchUserAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/lib/api/orders';
import AddressCard from '@/components/account/AddressCard';
import EmptyState from '@/components/ui/EmptyState';
import Field from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import Dialog, { ConfirmDialog } from '@/components/ui/Dialog';
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

  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const FIELDS = [
    { name: 'name', label: 'Full name', type: 'text', wide: true, autoComplete: 'name', required: true },
    { name: 'phone', label: 'Mobile number', type: 'tel', wide: false, autoComplete: 'tel-national', required: true },
    { name: 'pincode', label: 'Pincode', type: 'text', wide: false, autoComplete: 'postal-code', required: true },
    { name: 'line1', label: 'Address line 1', type: 'text', wide: true, autoComplete: 'address-line1', required: true },
    { name: 'line2', label: 'Address line 2', type: 'text', wide: true, autoComplete: 'address-line2', required: false },
    { name: 'city', label: 'City', type: 'text', wide: false, autoComplete: 'address-level2', required: true },
    { name: 'state', label: 'State', type: 'text', wide: false, autoComplete: 'address-level1', required: true },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">My addresses</h1>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add address
        </Button>
      </div>

      {isLoading && <Skeleton className="h-36 rounded-xl" />}

      {!isLoading && addresses.length === 0 && (
        <EmptyState compact title="No saved addresses" description="Add an address to speed up checkout." icon={<MapPin />} />
      )}

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {addresses.map((addr) => (
          <li key={addr._id}>
            <AddressCard address={addr} onEdit={openEdit} onDelete={(id) => setPendingDelete(id)} onSetDefault={(id) => defaultMutation.mutate(id)} />
          </li>
        ))}
      </ul>

      <Dialog
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editing ? 'Edit address' : 'New address'}
        size="lg"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" form="address-form" loading={saveMutation.isPending}>
              Save address
            </Button>
          </div>
        }
      >
        <form id="address-form" onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="grid grid-cols-1 gap-4 sm:grid-cols-2" noValidate>
          {FIELDS.map((f) => (
            <Field key={f.name} label={f.label} required={f.required} hint={f.required ? undefined : 'Optional'} error={errors[f.name]?.message} className={f.wide ? 'sm:col-span-2' : ''}>
              <Input {...register(f.name)} type={f.type} autoComplete={f.autoComplete} inputMode={f.name === 'phone' || f.name === 'pincode' ? 'numeric' : undefined} />
            </Field>
          ))}
        </form>
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this address?"
        description="You can add it again later."
        confirmLabel="Delete address"
        destructive
        loading={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete, { onSettled: () => setPendingDelete(null) })}
      />
    </div>
  );
}
