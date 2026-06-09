'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { fetchUserAddresses } from '@/lib/api/orders';
import type { Address } from '@/types/user';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
];

const addressSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'),
  line1: z.string().min(5, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressStepProps {
  onContinue: (address: Address) => void;
}

export default function AddressStep({ onContinue }: AddressStepProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    },
  });

  useEffect(() => {
    if (!isAuthenticated()) return;
    setLoading(true);
    fetchUserAddresses()
      .then((addresses) => {
        setSavedAddresses(addresses);
        const def = addresses.find((a) => a.isDefault) ?? addresses[0];
        if (def?._id) setSelectedId(def._id);
        if (addresses.length === 0) setShowForm(true);
      })
      .catch(() => setShowForm(true))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleContinue = () => {
    if (showForm) return; // handled by form submit
    const address = savedAddresses.find((a) => a._id === selectedId);
    if (address) onContinue(address);
  };

  const onFormSubmit = (values: AddressFormValues) => {
    const address: Address = { ...values };
    onContinue(address);
  };

  const handleAddNew = () => {
    reset({ name: user?.name ?? '', phone: user?.phone ?? '' });
    setShowForm(true);
    setSelectedId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-primary" />
        Delivery Address
      </h2>

      {/* Saved addresses */}
      {savedAddresses.length > 0 && !showForm && (
        <div className="space-y-3">
          {savedAddresses.map((addr) => (
            <label
              key={addr._id}
              className={`flex gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                selectedId === addr._id
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="address"
                value={addr._id}
                checked={selectedId === addr._id}
                onChange={() => setSelectedId(addr._id!)}
                className="mt-1 accent-primary"
              />
              <div className="text-sm text-gray-700 leading-relaxed">
                <p className="font-semibold text-gray-900">{addr.name}</p>
                <p>{addr.phone}</p>
                <p>
                  {addr.line1}
                  {addr.line2 ? `, ${addr.line2}` : ''}
                </p>
                <p>
                  {addr.city}, {addr.state} — {addr.pincode}
                </p>
                {addr.isDefault && (
                  <span className="inline-block mt-1 text-xs font-medium text-primary bg-primary/10 rounded px-1.5 py-0.5">
                    Default
                  </span>
                )}
              </div>
            </label>
          ))}

          <button
            type="button"
            onClick={handleAddNew}
            className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline"
          >
            <Plus className="w-4 h-4" />
            Add new address
          </button>

          <button
            type="button"
            disabled={!selectedId}
            onClick={handleContinue}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-dark transition-colors"
          >
            Continue to Payment
          </button>
        </div>
      )}

      {/* New address form */}
      {showForm && (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {savedAddresses.length > 0 && (
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              ← Back to saved addresses
            </button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="Rahul Sharma"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                {...register('phone')}
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('line1')}
              placeholder="House no., Street, Area"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors.line1 && (
              <p className="mt-1 text-xs text-red-500">{errors.line1.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
              <span className="ml-1 text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              {...register('line2')}
              placeholder="Landmark, Colony (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                {...register('city')}
                placeholder="Mumbai"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.city && (
                <p className="mt-1 text-xs text-red-500">{errors.city.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State <span className="text-red-500">*</span>
              </label>
              <select
                {...register('state')}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="mt-1 text-xs text-red-500">{errors.state.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pincode <span className="text-red-500">*</span>
              </label>
              <input
                {...register('pincode')}
                type="text"
                inputMode="numeric"
                placeholder="400001"
                maxLength={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {errors.pincode && (
                <p className="mt-1 text-xs text-red-500">{errors.pincode.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-primary text-white font-semibold disabled:opacity-50 hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Continue to Payment
          </button>
        </form>
      )}
    </div>
  );
}
