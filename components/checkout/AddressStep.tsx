'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, Plus, Loader2, Truck } from 'lucide-react';
import Field from '@/components/ui/Field';
import { Input, Select, RadioCard } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { useAuthStore } from '@/lib/store/authStore';
import { fetchUserAddresses } from '@/lib/api/orders';
import { validatePincode, lookupPincodeState } from '@/lib/shipping';
import { formatPrice } from '@/lib/formatters';
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
  /** Reports the delivery state/pincode so the parent can fetch the server quote. */
  onShippingChange: (destination: { pincode: string; state: string }) => void;
  initialPincode?: string;
  /** Shipping from the server quote for the current state (null while unknown). */
  quotedShipping?: number | null;
}

export default function AddressStep({ onContinue, onShippingChange, initialPincode, quotedShipping = null }: AddressStepProps) {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      pincode: initialPincode ?? '',
    },
  });

  const pincodeValue = watch('pincode');
  const stateValue = watch('state');

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

  useEffect(() => {
    if (!validatePincode(pincodeValue)) {
      setPincodeLoading(false);
      setPincodeError('');
      return;
    }

    let cancelled = false;
    setPincodeLoading(true);
    setPincodeError('');

    lookupPincodeState(pincodeValue).then((state) => {
      if (cancelled) return;
      setPincodeLoading(false);

      if (state) {
        setValue('state', state, { shouldValidate: true });
        onShippingChange({ pincode: pincodeValue, state });
      } else {
        setPincodeError('Could not detect state. Please select manually.');
        onShippingChange({ pincode: pincodeValue, state: '' });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pincodeValue, setValue, onShippingChange]);

  const handleContinue = () => {
    if (showForm) return; // handled by form submit
    const address = savedAddresses.find((a) => a._id === selectedId);
    if (address) {
      onShippingChange({ pincode: address.pincode, state: address.state });
      onContinue(address);
    }
  };

  const onFormSubmit = (values: AddressFormValues) => {
    const address: Address = { ...values };
    onShippingChange({ pincode: values.pincode, state: values.state });
    onContinue(address);
  };

  const handleAddNew = () => {
    reset({ name: user?.name ?? '', phone: user?.phone ?? '' });
    setShowForm(true);
    setSelectedId(null);
  };

  const errorList = Object.entries(errors).filter(([, e]) => e?.message) as [keyof AddressFormValues, { message?: string }][];
  const FIELD_LABELS: Record<keyof AddressFormValues, string> = {
    name: 'Full name', phone: 'Mobile number', line1: 'Address line 1', line2: 'Address line 2', city: 'City', state: 'State', pincode: 'Pincode',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner label="Loading your addresses" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <MapPin className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        Delivery address
      </h2>

      {/* Saved addresses */}
      {savedAddresses.length > 0 && !showForm && (
        <div className="space-y-3">
          <fieldset className="space-y-3">
            <legend className="sr-only">Choose a saved address</legend>
            {savedAddresses.map((addr) => (
              <RadioCard
                key={addr._id}
                name="address"
                value={addr._id}
                checked={selectedId === addr._id}
                onChange={() => setSelectedId(addr._id!)}
              >
                <div className="text-sm leading-relaxed text-muted-foreground">
                  <p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                    {addr.name}
                    {addr.isDefault && <Badge variant="neutral">Default</Badge>}
                  </p>
                  <p>{addr.phone}</p>
                  <p>
                    {addr.line1}
                    {addr.line2 ? `, ${addr.line2}` : ''}
                  </p>
                  <p>
                    {addr.city}, {addr.state} — {addr.pincode}
                  </p>
                </div>
              </RadioCard>
            ))}
          </fieldset>

          <Button variant="link" onClick={handleAddNew}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a new address
          </Button>

          <Button size="lg" fullWidth disabled={!selectedId} onClick={handleContinue}>
            Continue to payment
          </Button>
        </div>
      )}

      {/* New address form */}
      {showForm && (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5" noValidate>
          {savedAddresses.length > 0 && (
            <button type="button" onClick={() => setShowForm(false)} className="text-sm font-medium text-primary hover:underline">
              ← Back to saved addresses
            </button>
          )}

          {errorList.length > 1 && (
            <div role="alert" className="rounded-xl border border-error/20 bg-error-subtle p-4 text-sm">
              <p className="font-semibold text-error">Please fix {errorList.length} fields:</p>
              <ul className="mt-1 list-disc pl-5 text-foreground">
                {errorList.map(([field, e]) => (
                  <li key={field}>
                    <a href={`#address-${field}`} className="underline">
                      {FIELD_LABELS[field]}
                    </a>
                    : {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Full name" required error={errors.name?.message} id="address-name">
              <Input {...register('name')} autoComplete="name" />
            </Field>
            <Field label="Mobile number" required error={errors.phone?.message} hint="10-digit Indian mobile number" id="address-phone">
              <Input {...register('phone')} type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={10} />
            </Field>
          </div>

          <Field label="Address line 1" required error={errors.line1?.message} hint="House no., street, area" id="address-line1">
            <Input {...register('line1')} autoComplete="address-line1" />
          </Field>

          <Field label="Address line 2" hint="Landmark, colony (optional)" id="address-line2">
            <Input {...register('line2')} autoComplete="address-line2" />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field label="Pincode" required error={errors.pincode?.message} hint={pincodeError || undefined} id="address-pincode">
              <div className="relative">
                <Input {...register('pincode')} type="text" inputMode="numeric" autoComplete="postal-code" maxLength={6} />
                {pincodeLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden="true" />}
              </div>
            </Field>

            <Field label="City" required error={errors.city?.message} id="address-city">
              <Input {...register('city')} autoComplete="address-level2" />
            </Field>

            <Field label="State" required error={errors.state?.message} id="address-state">
              <Select
                {...register('state')}
                autoComplete="address-level1"
                onChange={(e) => {
                  register('state').onChange(e);
                  if (validatePincode(pincodeValue)) {
                    onShippingChange({ pincode: pincodeValue, state: e.target.value });
                  }
                }}
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          {pincodeValue && validatePincode(pincodeValue) && !pincodeLoading && !pincodeError && stateValue && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
              <Truck className="h-4 w-4 shrink-0" aria-hidden="true" />
              Shipping to {stateValue}:{' '}
              <span className="font-semibold text-foreground">
                {quotedShipping === null ? 'Calculating…' : quotedShipping === 0 ? 'Free' : formatPrice(quotedShipping)}
              </span>
            </p>
          )}

          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            Continue to payment
          </Button>
        </form>
      )}
    </div>
  );
}
